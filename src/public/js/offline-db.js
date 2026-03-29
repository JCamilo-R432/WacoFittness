/**
 * WacoPro Offline Database
 * Native IndexedDB wrapper for offline-first data persistence
 * API compatible with Dexie.js patterns
 */
(function () {
  'use strict';

  var DB_NAME = 'wacopro-offline';
  var DB_VERSION = 1;

  function WacoProDB() {
    this.db = null;
    this._ready = this._init();
  }

  WacoProDB.prototype._init = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = function () { reject(req.error); };
      req.onsuccess = function () { self.db = req.result; resolve(self.db); };
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        var stores = [
          { name: 'workouts', indexes: ['userId', 'synced', 'updatedAt'] },
          { name: 'exercises', indexes: ['muscle', 'category'] },
          { name: 'progress', indexes: ['userId', 'date', 'synced'] },
          { name: 'recovery', indexes: ['userId', 'date', 'synced'] },
          { name: 'plans', indexes: ['userId', 'synced'] },
          { name: 'nutrition', indexes: ['userId', 'date', 'synced'] },
        ];
        stores.forEach(function (s) {
          if (!db.objectStoreNames.contains(s.name)) {
            var os = db.createObjectStore(s.name, { keyPath: 'id' });
            s.indexes.forEach(function (idx) { os.createIndex(idx, idx, { unique: false }); });
          }
        });
        if (!db.objectStoreNames.contains('queue')) {
          var qs = db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
          qs.createIndex('createdAt', 'createdAt', { unique: false });
          qs.createIndex('retries', 'retries', { unique: false });
        }
      };
    });
  };

  WacoProDB.prototype._getStore = function (name, mode) {
    var self = this;
    return self._ready.then(function () {
      return self.db.transaction(name, mode || 'readonly').objectStore(name);
    });
  };

  WacoProDB.prototype.put = function (storeName, item) {
    return this._getStore(storeName, 'readwrite').then(function (store) {
      return new Promise(function (res, rej) {
        var obj = Object.assign({}, item, { updatedAt: new Date().toISOString(), synced: item.synced !== undefined ? item.synced : false });
        var r = store.put(obj);
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
    });
  };

  WacoProDB.prototype.get = function (storeName, id) {
    return this._getStore(storeName).then(function (store) {
      return new Promise(function (res, rej) {
        var r = store.get(id);
        r.onsuccess = function () { res(r.result || null); };
        r.onerror = function () { rej(r.error); };
      });
    });
  };

  WacoProDB.prototype.getAll = function (storeName) {
    return this._getStore(storeName).then(function (store) {
      return new Promise(function (res, rej) {
        var r = store.getAll();
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
    });
  };

  WacoProDB.prototype.delete = function (storeName, id) {
    return this._getStore(storeName, 'readwrite').then(function (store) {
      return new Promise(function (res, rej) {
        var r = store.delete(id);
        r.onsuccess = function () { res(); };
        r.onerror = function () { rej(r.error); };
      });
    });
  };

  WacoProDB.prototype.getUnsynced = function (storeName) {
    return this._getStore(storeName).then(function (store) {
      return new Promise(function (res, rej) {
        var idx = store.index('synced');
        var r = idx.getAll(false);
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
    });
  };

  WacoProDB.prototype.markSynced = function (storeName, id) {
    var self = this;
    return self._ready.then(function () {
      var tx = self.db.transaction(storeName, 'readwrite');
      var store = tx.objectStore(storeName);
      return new Promise(function (res, rej) {
        var gr = store.get(id);
        gr.onsuccess = function () {
          if (!gr.result) return res();
          var pr = store.put(Object.assign({}, gr.result, { synced: true }));
          pr.onsuccess = function () { res(); };
          pr.onerror = function () { rej(pr.error); };
        };
        gr.onerror = function () { rej(gr.error); };
      });
    });
  };

  // ── Offline Queue ──────────────────────────────────────────────────────────

  WacoProDB.prototype.enqueue = function (action) {
    return this._getStore('queue', 'readwrite').then(function (store) {
      return new Promise(function (res, rej) {
        var r = store.add(Object.assign({}, action, { createdAt: new Date().toISOString(), retries: 0 }));
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      });
    });
  };

  WacoProDB.prototype.dequeue = function (id) {
    return this.delete('queue', id);
  };

  WacoProDB.prototype.getPendingQueue = function () {
    return this.getAll('queue');
  };

  WacoProDB.prototype.incrementRetry = function (id) {
    var self = this;
    return self._ready.then(function () {
      var tx = self.db.transaction('queue', 'readwrite');
      var store = tx.objectStore('queue');
      return new Promise(function (res, rej) {
        var gr = store.get(id);
        gr.onsuccess = function () {
          if (!gr.result) return res();
          var pr = store.put(Object.assign({}, gr.result, { retries: (gr.result.retries || 0) + 1 }));
          pr.onsuccess = function () { res(); };
          pr.onerror = function () { rej(pr.error); };
        };
        gr.onerror = function () { rej(gr.error); };
      });
    });
  };

  // ── Sync Manager ──────────────────────────────────────────────────────────

  function SyncManager(db, apiBase, getToken) {
    this.db = db;
    this.apiBase = apiBase;
    this.getToken = getToken;
    this._syncing = false;
    var self = this;
    window.addEventListener('online', function () {
      console.log('[WacoPro] Back online — syncing...');
      self.sync();
    });
  }

  SyncManager.prototype.sync = function () {
    var self = this;
    if (self._syncing || !navigator.onLine) return Promise.resolve();
    self._syncing = true;
    var token = self.getToken();
    if (!token) { self._syncing = false; return Promise.resolve(); }
    return self._processQueue(token)
      .then(function () {
        window.dispatchEvent(new CustomEvent('wacopro:sync-complete'));
      })
      .catch(function (err) {
        window.dispatchEvent(new CustomEvent('wacopro:sync-error', { detail: { error: err.message } }));
      })
      .then(function () { self._syncing = false; });
  };

  SyncManager.prototype._processQueue = function (token) {
    var self = this;
    return self.db.getPendingQueue().then(function (queue) {
      var tasks = queue.map(function (item) {
        if (item.retries >= 3) return self.db.dequeue(item.id);
        return fetch(self.apiBase + item.url, {
          method: item.method || 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: item.body ? JSON.stringify(item.body) : undefined,
        }).then(function (res) {
          if (res.ok || res.status === 409) return self.db.dequeue(item.id);
          return self.db.incrementRetry(item.id);
        }).catch(function () {
          return self.db.incrementRetry(item.id);
        });
      });
      return Promise.all(tasks);
    });
  };

  // ── Initialize globals ────────────────────────────────────────────────────

  try {
    window.WacoDB = new WacoProDB();
    window.WacoSync = new SyncManager(
      window.WacoDB,
      window.location.origin,
      function () { return localStorage.getItem('wacoPro_token') || localStorage.getItem('token'); }
    );
    // Attempt sync immediately if online
    if (navigator.onLine) {
      window.WacoSync.sync().catch(function () {});
    }
  } catch (e) {
    console.warn('[WacoPro] Offline DB init failed:', e);
  }

})();
