/**
 * WacoPro Fitness - Dashboard Controller
 * API calls with localStorage fallback for offline support
 */

// ── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  document.getElementById('dateText').textContent =
    new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  await loadUser();
  await loadSectionData('dashboard');
});

async function loadUser() {
  try {
    const cached = window.api.getCurrentUser();
    if (cached) setUserName(cached.name || cached.email);
    const profile = await window.api.getProfile();
    if (profile) { setUserName(profile.name || profile.email); localStorage.setItem('user', JSON.stringify(profile)); }
  } catch { /* silent */ }
}

function setUserName(fullName) {
  const first = (fullName || 'Usuario').split(' ')[0];
  ['welcomeName','navUserName'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = first; });
}

// ── Section Navigation ───────────────────────────────────────────────────────
function loadSection(name, linkEl) {
  document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
  if (linkEl) linkEl.classList.add('active');
  document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('section-' + name);
  if (target) target.classList.add('active');
  loadSectionData(name);
}

async function loadSectionData(name) {
  const fn = { dashboard: loadDashboard, nutrition: loadNutrition, training: loadTraining,
    supplements: loadSupplements, hydration: loadHydration, recovery: loadRecovery,
    shopping: loadShopping, progress: loadProgress }[name];
  if (fn) await fn();
}

// ── localStorage helpers ─────────────────────────────────────────────────────
const LS = {
  get: (key, def = []) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); } catch { return def; } },
  set: (key, val)       => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  push: (key, item)     => { const arr = LS.get(key); arr.push(item); LS.set(key, arr); },
};

function todayItems(arr) {
  const today = new Date().toDateString();
  return arr.filter(i => new Date(i.createdAt || i.loggedAt || i.workoutDate || Date.now()).toDateString() === today);
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  // Stats: sum local meals for calories, local water, local workouts
  const meals    = todayItems(LS.get('waco_meals'));
  const water    = todayItems(LS.get('waco_water'));
  const workouts = todayItems(LS.get('waco_workouts'));

  const cals  = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const waterMl = water.reduce((s, w) => s + (w.amountMl || 0), 0);

  setEl('caloriesConsumed', cals  || '1,850');
  setEl('workoutsCompleted', workouts.length || '3');
  setEl('waterIntake', waterMl || '2,100');
  setEl('caloriesBurned', workouts.reduce((s, w) => s + Math.round((w.durationMinutes || 60) * 7), 0) || '450');

  // Recent activity — built from local logs
  const allActivities = [
    ...meals.map(m    => ({ icon:'🍎', title: m.foodName || 'Comida registrada',      t: m.createdAt })),
    ...workouts.map(w => ({ icon:'💪', title: w.name || 'Entrenamiento completado',   t: w.createdAt })),
    ...water.map(l    => ({ icon:'💧', title: `${l.amountMl}ml de agua añadidos`,     t: l.createdAt })),
  ].sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 5);

  if (allActivities.length) {
    setEl('recentActivity', allActivities.map(a => `
      <div class="activity-item">
        <span class="activity-icon">${a.icon}</span>
        <div><div class="activity-title">${a.title}</div>
        <div class="activity-time">${timeAgo(a.t)}</div></div>
      </div>`).join(''));
  } else {
    setEl('recentActivity', demoBadgeList([
      { icon:'🍎', title:'Desayuno registrado',      time:'HACE 2 HORAS' },
      { icon:'💪', title:'Entrenamiento completado', time:'AYER' },
      { icon:'💧', title:'Meta de agua alcanzada',   time:'HACE 2 DÍAS' },
    ]));
  }

  // Next workout from API or local
  try {
    const list = await window.api.testEndpoint('GET', '/api/training/workouts?limit=1');
    const w = Array.isArray(list) && list[0];
    if (!w) throw new Error('empty');
    setEl('nextWorkout', `
      <div style="padding:0.5rem 0;">
        <div style="font-family:'Orbitron',sans-serif;font-size:0.9rem;color:#fff;margin-bottom:0.375rem;">${w.name}</div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-bottom:1rem;">${w.description || ''}</div>
        <button class="btn-neon" style="font-size:0.7rem;padding:0.5rem 1.25rem;"
          onclick="window.showNotification('Iniciando entrenamiento...','info')">INICIAR</button>
      </div>`);
  } catch {
    setEl('nextWorkout', `
      <div class="empty-state">
        <p>No tienes entrenamientos programados</p>
        <button class="btn-neon" style="margin:0.75rem auto 0;" onclick="openModal('modalCreateWorkout')">CREAR RUTINA</button>
      </div>`);
  }
}

// ── NUTRICIÓN ────────────────────────────────────────────────────────────────
async function loadNutrition() {
  // Merge API + localStorage
  let apiMeals = [];
  try {
    const res = await window.api.testEndpoint('GET', '/api/nutrition/meal-logs?limit=20');
    if (Array.isArray(res) && res.length) apiMeals = res;
  } catch { /* use local only */ }

  const localMeals = todayItems(LS.get('waco_meals'));
  const meals = [...apiMeals, ...localMeals];

  // Macros
  const cals  = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const prot  = meals.reduce((s, m) => s + (m.proteinG || 0), 0);
  const carbs = meals.reduce((s, m) => s + (m.carbsG || 0), 0);
  const fat   = meals.reduce((s, m) => s + (m.fatG || 0), 0);

  if (meals.length) {
    setEl('nutCalories', `${cals} kcal`);  setBar('barCalories', cals,  2000);
    setEl('nutProtein',  `${prot}g`);      setBar('barProtein',  prot,  150);
    setEl('nutCarbs',    `${carbs}g`);     setBar('barCarbs',    carbs, 250);
    setEl('nutFat',      `${fat}g`);       setBar('barFat',      fat,   70);

    setEl('todayMeals', meals.map(m => `
      <div class="list-row">
        <div>
          <div class="list-name">${m.foodName || m.food?.name || m.customFoodName || 'Alimento'}</div>
          <div class="list-sub">${mealTypeLabel(m.mealType)} · P:${m.proteinG||0}g C:${m.carbsG||0}g G:${m.fatG||0}g</div>
        </div>
        <span class="pill-neon">${m.calories||0} kcal</span>
      </div>`).join(''));
  } else {
    // Demo
    setEl('nutCalories','1,850 kcal'); setEl('nutProtein','140g'); setEl('nutCarbs','200g'); setEl('nutFat','55g');
    setBar('barCalories',1850,2000); setBar('barProtein',140,150); setBar('barCarbs',200,250); setBar('barFat',55,70);
    setEl('todayMeals', demoBadgeList([
      { icon:'🌅', title:'Avena con frutas',     time:'Desayuno · 380 kcal' },
      { icon:'🍗', title:'Pechuga a la plancha', time:'Almuerzo · 320 kcal' },
      { icon:'🥗', title:'Ensalada mixta',       time:'Cena · 200 kcal' },
    ], true));
  }

  // Popular foods from API
  try {
    const foods = await window.api.testEndpoint('GET', '/api/nutrition/food?limit=8');
    const list = Array.isArray(foods) ? foods : [];
    if (!list.length) throw new Error('empty');
    setEl('popularFoods', list.map(f => `
      <div class="list-row">
        <div class="list-name">${f.name}</div>
        <span class="pill-cyan">${f.caloriesPer100g || f.calories || 0} kcal</span>
      </div>`).join(''));
  } catch {
    setEl('popularFoods', [
      ['Pechuga de pollo','165 kcal'], ['Arroz blanco','130 kcal'], ['Huevo entero','155 kcal'],
      ['Atún al natural','116 kcal'], ['Avena','389 kcal'],         ['Brócoli','34 kcal'],
    ].map(([n,c]) => `<div class="list-row"><div class="list-name">${n}</div><span class="pill-cyan">${c}</span></div>`).join(''));
  }
}

// ── ENTRENAMIENTO ────────────────────────────────────────────────────────────
async function loadTraining() {
  let apiWorkouts = [];
  try {
    const res = await window.api.testEndpoint('GET', '/api/training/workouts?limit=20');
    if (Array.isArray(res) && res.length) apiWorkouts = res;
  } catch { /* use local */ }

  const localWorkouts = LS.get('waco_workouts');
  const allWorkouts = [...apiWorkouts, ...localWorkouts];

  // Exercises count from API
  try {
    const exs = await window.api.testEndpoint('GET', '/api/training/exercises?limit=1');
    setEl('totalExercises', exs?.pagination?.total || '2,000+');
  } catch { setEl('totalExercises', '2,000+'); }

  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = allWorkouts.filter(w => new Date(w.createdAt || w.workoutDate || 0) >= weekAgo);
  const totalMin  = allWorkouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);

  setEl('weeklyWorkouts', thisWeek.length || '—');
  setEl('totalTime', totalMin ? `${totalMin} min` : '—');

  if (allWorkouts.length) {
    setEl('myWorkouts', allWorkouts.map(w => `
      <div class="workout-row">
        <div>
          <div class="list-name">${w.name}</div>
          <div class="list-sub">${w.durationMinutes || 60} min · ${w.notes ? w.notes.substring(0,40) + '…' : 'Sin notas'}</div>
        </div>
        <button class="pill-btn" onclick="window.showNotification('Vista de detalles próximamente','info')">VER</button>
      </div>`).join(''));
  } else {
    setEl('myWorkouts', `
      <div class="empty-state">
        <p>No tienes rutinas creadas aún</p>
        <button class="btn-neon" style="margin:0.75rem auto 0;" onclick="openModal('modalCreateWorkout')">CREAR PRIMERA RUTINA</button>
      </div>`);
  }
}

// ── SUPLEMENTOS ───────────────────────────────────────────────────────────────
const CATALOG = [
  { id:'s1', name:'Creatina Monohidrato', cat:'Fuerza' },
  { id:'s2', name:'Proteína Whey',        cat:'Proteína' },
  { id:'s3', name:'Vitamina D3',          cat:'Vitaminas' },
  { id:'s4', name:'Omega-3',             cat:'Salud general' },
  { id:'s5', name:'Magnesio',            cat:'Minerales' },
  { id:'s6', name:'Zinc',               cat:'Minerales' },
  { id:'s7', name:'Cafeína',            cat:'Pre-workout' },
  { id:'s8', name:'Beta-Alanina',       cat:'Pre-workout' },
  { id:'s9', name:'BCAA',              cat:'Recuperación' },
  { id:'s10',name:'Glutamina',         cat:'Recuperación' },
];

async function loadSupplements() {
  // My supplements: API + local
  let apiMine = [];
  try {
    const res = await window.api.testEndpoint('GET', '/api/supplements/user/list');
    if (Array.isArray(res) && res.length) apiMine = res;
  } catch { /* use local */ }

  const localMine = LS.get('waco_supplements');
  const allMine = [...apiMine, ...localMine];

  if (allMine.length) {
    setEl('mySupplements', allMine.map(s => `
      <div class="list-row">
        <div>
          <div class="list-name">${s.supplement?.name || s.name}</div>
          <div class="list-sub">${s.dosage || '1 dosis diaria'}</div>
        </div>
        <button class="pill-btn" onclick="removeSupplement('${s.id || s.name}')" style="border-color:rgba(239,68,68,0.3);color:#ef4444;">✕ QUITAR</button>
      </div>`).join(''));
  } else {
    setEl('mySupplements', `<div class="empty-state"><p>No has añadido suplementos aún</p></div>`);
  }

  // Catalog
  setEl('supplementCatalog', CATALOG.map(s => {
    const added = allMine.some(m => (m.supplementId || m.id) === s.id || m.name === s.name);
    return `
      <div class="list-row">
        <div>
          <div class="list-name">${s.name}</div>
          <div class="list-sub">${s.cat}</div>
        </div>
        ${added
          ? '<span class="pill-neon">AÑADIDO</span>'
          : `<button class="pill-btn" onclick="addSupplement('${s.id}','${s.name}')">+ AÑADIR</button>`
        }
      </div>`;
  }).join(''));
}

async function addSupplement(id, name) {
  const entry = { id, supplementId: id, name, dosage: '1 dosis diaria', createdAt: new Date().toISOString() };
  try {
    await window.api.request('POST', '/api/supplements/user', entry, true);
  } catch { /* API error: save locally */ }
  LS.push('waco_supplements', entry);
  window.showNotification(`${name} añadido ✓`, 'success');
  await loadSupplements();
}

function removeSupplement(idOrName) {
  const arr = LS.get('waco_supplements').filter(s => s.id !== idOrName && s.name !== idOrName);
  LS.set('waco_supplements', arr);
  window.showNotification('Suplemento eliminado', 'success');
  loadSupplements();
}

// ── HIDRATACIÓN ───────────────────────────────────────────────────────────────
async function loadHydration() {
  let goal = 2100;
  try { const g = await window.api.testEndpoint('GET', '/api/hydration/goal'); if (g?.dailyGoalMl) goal = g.dailyGoalMl; } catch {}
  setEl('waterGoalLbl', `meta: ${goal}`);

  let apiLogs = [];
  try {
    const res = await window.api.testEndpoint('GET', '/api/hydration/logs?limit=20');
    if (Array.isArray(res) && res.length) apiLogs = res;
  } catch {}

  const localLogs = todayItems(LS.get('waco_water'));
  const allLogs = [...apiLogs, ...localLogs];
  const total = allLogs.reduce((s, l) => s + (l.amountMl || 0), 0);

  updateWaterRing(total, goal);

  if (allLogs.length) {
    setEl('waterHistory', allLogs.map(l => `
      <div class="list-row">
        <span>💧 ${l.amountMl} ml</span>
        <span class="list-sub">${formatTime(l.loggedAt || l.createdAt)}</span>
      </div>`).join(''));
  } else {
    setEl('waterHistory', `<div class="empty-state"><p>No has registrado agua hoy</p></div>`);
  }
}

function updateWaterRing(current, goal) {
  setEl('waterMl', current.toLocaleString());
  const pct = Math.min(current / goal, 1);
  const offset = (2 * Math.PI * 50 * (1 - pct)).toFixed(1);
  const bar = document.getElementById('waterRingBar');
  if (bar) bar.style.strokeDashoffset = offset;
}

// ── RECUPERACIÓN ──────────────────────────────────────────────────────────────
const TECHNIQUES = [
  { type:'breathing',  name:'Respiración 4-7-8',     dur:'5 min',  desc:'Reduce ansiedad y calma el sistema nervioso' },
  { type:'bodyScan',   name:'Escaneo Corporal',        dur:'15 min', desc:'Libera tensión muscular progresivamente' },
  { type:'relaxation', name:'Relajación Muscular',     dur:'10 min', desc:'Contrae y relaja cada grupo muscular' },
  { type:'meditation', name:'Meditación Guiada',       dur:'10 min', desc:'Enfoca la mente y reduce el estrés' },
];

async function loadRecovery() {
  // Sleep logs from API
  let avgH = '—', quality = '—', score = '—';
  try {
    const logs = await window.api.testEndpoint('GET', '/api/rest/sleep-logs?limit=7');
    const list = Array.isArray(logs) ? logs : [];
    if (list.length) {
      avgH    = (list.reduce((s, l) => s + (l.durationHours || l.hours || 0), 0) / list.length).toFixed(1) + 'h';
      quality = qualityLabel(list[0].quality || list[0].sleepQuality);
      setEl('sleepRecords', list.map(l => `
        <div class="list-row">
          <div><div class="list-name">${(l.durationHours||l.hours||0).toFixed(1)}h de sueño</div>
          <div class="list-sub">${formatDate(l.sleepDate||l.date||l.createdAt)}</div></div>
          <span class="pill-cyan">${qualityLabel(l.quality||l.sleepQuality)}</span>
        </div>`).join(''));
    } else throw new Error('empty');
  } catch {
    avgH = '7.5h'; quality = 'Buena';
    setEl('sleepRecords', demoBadgeList([
      { icon:'🌙', title:'7.5h · Ayer',       time:'Calidad: Buena' },
      { icon:'🌙', title:'8.0h · Hace 2 días', time:'Calidad: Muy buena' },
      { icon:'🌙', title:'6.5h · Hace 3 días', time:'Calidad: Regular' },
    ], true));
  }

  try { const s = await window.api.testEndpoint('GET', '/api/rest/recovery-score'); score = (s?.score||s?.recoveryScore||50)+'/100'; } catch { score = '50/100'; }

  setEl('avgSleep', avgH); setEl('sleepQuality', quality); setEl('recoveryScore', score);

  // Relaxation techniques (always static)
  setEl('relaxationTechniques', TECHNIQUES.map((t, i) => `
    <div class="technique-row">
      <div>
        <div class="list-name">${t.name}</div>
        <div class="list-sub">${t.dur} · ${t.desc}</div>
      </div>
      <button class="btn-neon" style="font-size:0.65rem;padding:0.45rem 1rem;white-space:nowrap;"
        onclick="startRelaxation('${t.type}', ${i})">INICIAR</button>
    </div>`).join(''));
}

// Relaxation modal
function startRelaxation(type, index) {
  const tech = TECHNIQUES[index];
  const modal = document.createElement('div');
  modal.id = 'relaxModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:520px;text-align:center;">
      <div class="modal-head">
        <span class="modal-title">😌 ${tech.name.toUpperCase()}</span>
        <button class="modal-close" onclick="closeRelaxModal()">✕</button>
      </div>
      <div class="relax-body">
        <div class="breath-circle" id="breathCircle"></div>
        <p class="breath-label" id="breathLabel">Prepárate...</p>
        <div class="relax-timer" id="relaxTimer">${tech.dur}</div>
        <p style="font-size:0.75rem;color:rgba(255,255,255,0.35);margin-bottom:1.5rem;">${tech.desc}</p>
        <button class="btn-neon" onclick="closeRelaxModal()">FINALIZAR SESIÓN</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => { modal.style.display='flex'; requestAnimationFrame(() => modal.classList.add('modal-open')); });
  startBreathingCycle();
}

function closeRelaxModal() {
  const m = document.getElementById('relaxModal');
  if (!m) return;
  m.classList.remove('modal-open');
  setTimeout(() => m.remove(), 280);
  window.showNotification('Sesión de relajación completada ✓', 'success');
}

let breathTimer = null;
function startBreathingCycle() {
  const circle = document.getElementById('breathCircle');
  const label  = document.getElementById('breathLabel');
  if (!circle || !label) return;

  const phases = [
    { text:'Inhala...', scale:'scale(1.4)', dur:4000 },
    { text:'Mantén...', scale:'scale(1.4)', dur:7000 },
    { text:'Exhala...',  scale:'scale(1)',   dur:8000 },
  ];
  let i = 0;

  function next() {
    if (!document.getElementById('breathCircle')) return;
    const ph = phases[i % phases.length];
    label.textContent  = ph.text;
    circle.style.transform = ph.scale;
    i++;
    breathTimer = setTimeout(next, ph.dur);
  }
  next();
}

// ── COMPRAS ───────────────────────────────────────────────────────────────────
const localCart = LS.get('waco_cart');

async function loadShopping() {
  renderCart();
  try {
    const lists = await window.api.testEndpoint('GET', '/api/shopping/lists?limit=5');
    const arr = Array.isArray(lists) ? lists : [];
    if (!arr.length) throw new Error('empty');
    setEl('shoppingLists', arr.map(l => `
      <div class="list-row">
        <div><div class="list-name">${l.name||l.title||'Lista'}</div>
        <div class="list-sub">${l.items?.length||l.itemCount||0} items</div></div>
        <span class="pill-cyan">${l.status||'Activa'}</span>
      </div>`).join(''));
  } catch { setEl('shoppingLists', `<div class="empty-state"><p>No tienes listas guardadas</p></div>`); }
}

function renderCart() {
  if (!localCart.length) { setEl('shoppingContent', '<div class="empty-state"><p>Tu lista está vacía</p></div>'); return; }
  setEl('shoppingContent', '<ul class="shop-list">' + localCart.map((item, i) => `
    <li class="shop-item ${item.done ? 'done' : ''}">
      <input type="checkbox" ${item.done?'checked':''} onchange="toggleCart(${i})">
      <span>${item.name}</span>
      <button class="del-btn" onclick="removeCart(${i})">✕</button>
    </li>`).join('') + '</ul>');
}

function addShoppingItem() {
  const input = document.getElementById('shoppingInput');
  const name = input?.value.trim();
  if (!name) return;
  localCart.push({ name, done: false });
  LS.set('waco_cart', localCart);
  renderCart();
  if (input) input.value = '';
  window.showNotification('Item añadido ✓', 'success');
}

function toggleCart(i) { localCart[i].done = !localCart[i].done; LS.set('waco_cart', localCart); renderCart(); }
function removeCart(i) { localCart.splice(i, 1); LS.set('waco_cart', localCart); renderCart(); }

// ── PROGRESO ──────────────────────────────────────────────────────────────────
async function loadProgress() {
  const localW = LS.get('waco_workouts');
  let apiW = [];
  try { const r = await window.api.testEndpoint('GET', '/api/training/workouts?limit=100'); if (Array.isArray(r)) apiW = r; } catch {}
  const all = [...apiW, ...localW];

  setEl('totalWorkouts', all.length || '—');
  setEl('activeDays', all.length ? Math.min(all.length * 2, 30) : '—');

  const streak = localW.length + apiW.slice(0,3).length;
  setEl('currentStreak', streak ? `🔥 ${Math.min(streak, 7)} días` : '—');

  // Bar chart
  const days = ['L','M','X','J','V','S','D'];
  const vals = days.map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return all.some(w => new Date(w.createdAt||w.workoutDate||0).toDateString() === d.toDateString()) ? 1 : 0;
  });
  const hasData = vals.some(v => v);
  const displayVals = hasData ? vals : [1,1,0,1,1,0,1]; // demo

  setEl('weeklyActivity', `
    <div class="bar-chart">
      ${days.map((d, i) => `
        <div class="bar-col">
          <div class="bar-fill" style="height:${displayVals[i]?'80%':'20%'};
            background:${displayVals[i]?'var(--neon-purple)':'rgba(255,255,255,0.08)'};
            box-shadow:${displayVals[i]?'0 0 8px var(--neon-purple)':'none'};"></div>
          <div class="bar-label">${d}</div>
        </div>`).join('')}
    </div>
    <div style="text-align:center;font-size:0.7rem;color:rgba(255,255,255,0.3);margin-top:0.5rem;font-family:'Orbitron',sans-serif;">
      ${displayVals.filter(v=>v).length} de 7 días activos esta semana</div>`);

  // Nutrition progress
  const localM = LS.get('waco_meals');
  if (localM.length) {
    setEl('nutritionProgress', localM.slice(-5).reverse().map(m => `
      <div class="list-row">
        <div class="list-name">${m.foodName || 'Comida'}</div>
        <span class="pill-cyan">${m.calories||0} kcal</span>
      </div>`).join(''));
  } else {
    setEl('nutritionProgress', `<div class="empty-state"><p>Registra comidas para ver tu progreso nutricional</p></div>`);
  }
}

// ── MODALES ───────────────────────────────────────────────────────────────────
function openModal(id) {
  const m = document.getElementById(id); if (!m) return;
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('modal-open'));
}
function closeModal(id) {
  const m = document.getElementById(id); if (!m) return;
  m.classList.remove('modal-open');
  setTimeout(() => { m.style.display = 'none'; }, 280);
}

// ── FORM SUBMITS ──────────────────────────────────────────────────────────────
async function submitMeal(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  setBtn(btn, true, 'REGISTRANDO...');

  const entry = {
    foodName:  document.getElementById('mealFood').value.trim(),
    calories:  +(document.getElementById('mealCalories').value) || 0,
    proteinG:  +(document.getElementById('mealProtein').value)  || 0,
    carbsG:    +(document.getElementById('mealCarbs').value)    || 0,
    fatG:      +(document.getElementById('mealFat').value)      || 0,
    mealType:  document.getElementById('mealType').value,
    createdAt: new Date().toISOString(),
  };

  // Try API; always save locally so data persists
  try { await window.api.request('POST', '/api/nutrition/meal-logs', entry, true); } catch { /* continue */ }
  LS.push('waco_meals', entry);

  window.showNotification('Comida registrada ✓', 'success');
  closeModal('modalMeal');
  e.target.reset();
  setBtn(btn, false, 'REGISTRAR');
  if (active('section-nutrition')) await loadNutrition();
  if (active('section-dashboard')) await loadDashboard();
}

async function submitWorkout(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  setBtn(btn, true, 'REGISTRANDO...');

  const entry = {
    name:            document.getElementById('workoutName').value.trim(),
    durationMinutes: +(document.getElementById('workoutDuration').value) || 60,
    notes:           document.getElementById('workoutNotes').value,
    workoutDate:     new Date().toISOString(),
    createdAt:       new Date().toISOString(),
  };

  try { await window.api.request('POST', '/api/training/workouts', entry, true); } catch { /* continue */ }
  LS.push('waco_workouts', entry);

  window.showNotification('Entrenamiento registrado ✓', 'success');
  closeModal('modalWorkout');
  e.target.reset();
  setBtn(btn, false, 'REGISTRAR');
  if (active('section-training'))  await loadTraining();
  if (active('section-dashboard')) await loadDashboard();
}

async function submitWater(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  setBtn(btn, true, 'AÑADIENDO...');

  const entry = { amountMl: +(document.getElementById('waterAmount').value), createdAt: new Date().toISOString() };

  try { await window.api.request('POST', '/api/hydration/logs', entry, true); } catch { /* continue */ }
  LS.push('waco_water', entry);

  window.showNotification('Agua añadida ✓', 'success');
  closeModal('modalWater');
  setBtn(btn, false, 'AGREGAR');
  if (active('section-hydration')) await loadHydration();
  if (active('section-dashboard')) await loadDashboard();
}

async function submitCreateWorkout(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  setBtn(btn, true, 'CREANDO...');

  const entry = {
    name:        document.getElementById('newWorkoutName').value.trim(),
    description: document.getElementById('newWorkoutDesc').value,
    scheduledAt: document.getElementById('newWorkoutDate').value,
    createdAt:   new Date().toISOString(),
  };

  try { await window.api.request('POST', '/api/training/workouts', entry, true); } catch { /* continue */ }
  LS.push('waco_workouts', { ...entry, workoutDate: entry.scheduledAt });

  window.showNotification('Rutina creada ✓', 'success');
  closeModal('modalCreateWorkout');
  e.target.reset();
  setBtn(btn, false, 'CREAR RUTINA');
  if (active('section-training')) await loadTraining();
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function setEl(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function setBar(id, val, max) { const el = document.getElementById(id); if (el) el.style.width = Math.min((val/max)*100, 100).toFixed(1)+'%'; }
function setBtn(btn, loading, text) { if (!btn) return; btn.disabled = loading; btn.textContent = text; }
function active(id) { return document.getElementById(id)?.classList.contains('active'); }

function demoBadgeList(items, withSub = false) {
  return items.map(i => `
    <div class="activity-item">
      <span class="activity-icon">${i.icon}</span>
      <div><div class="activity-title">${i.title}</div>
      <div class="activity-time">${withSub ? i.time : i.time}</div></div>
    </div>`).join('');
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'AHORA'; const m = Math.floor(s/60);
  if (m < 60) return `HACE ${m} MIN`; const h = Math.floor(m/60);
  if (h < 24) return `HACE ${h} H`;
  return `HACE ${Math.floor(h/24)} DÍAS`;
}
function formatTime(d) { return new Date(d).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' }); }
function formatDate(d) { return new Date(d).toLocaleDateString('es-ES', { weekday:'short', month:'short', day:'numeric' }); }
function mealTypeLabel(t) { return {breakfast:'Desayuno', lunch:'Almuerzo', dinner:'Cena', snack:'Snack'}[t] || t || ''; }
function qualityLabel(q) {
  return {1:'Muy mala',2:'Mala',3:'Regular',4:'Buena',5:'Muy buena',excellent:'Excelente',good:'Buena',poor:'Mala'}[q] || q || '—';
}
