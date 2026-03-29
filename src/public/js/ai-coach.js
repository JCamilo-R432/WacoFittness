// ── WacoCoach Voice Integration ───────────────────────────────────────────
// Fase 2: Web Speech API (STT + TTS) nativa del navegador.
// El backend NUNCA recibe ni envía audio — solo texto.
//
// Flujo de voz:
//   Usuario habla → [SpeechRecognition] → texto → POST /api/ai-coach/chat
//   ← { text: "respuesta..." } → [speechSynthesis] → audio para el usuario

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
//  SpeechToText — Reconocimiento de voz nativo del navegador
// ─────────────────────────────────────────────────────────────────────────────
class SpeechToText {
  constructor(options = {}) {
    this.onTranscript = options.onTranscript || (() => {});
    this.onError      = options.onError      || (() => {});
    this.onStart      = options.onStart      || (() => {});
    this.onEnd        = options.onEnd        || (() => {});

    // Soporte multi-navegador
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this.supported = false;
      console.warn('[WacoCoach STT] SpeechRecognition no soportado en este navegador.');
      return;
    }

    this.supported = true;
    this.isListening = false;
    this.finalTranscript = '';

    this.recognition = new SR();
    this.recognition.lang = options.lang || 'es-CO';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this._bindEvents();
  }

  _bindEvents() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.finalTranscript = '';
      this.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEnd(this.finalTranscript);
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this.finalTranscript += t;
        } else {
          interim += t;
        }
      }
      this.onTranscript(this.finalTranscript + interim, this.finalTranscript !== '');
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this.onError(this._friendlyError(event.error));
    };
  }

  _friendlyError(code) {
    const map = {
      'no-speech':      '🎤 No escuché nada. ¿Podés hablar un poco más fuerte?',
      'audio-capture':  '🎤 No se detectó micrófono. Revisá los permisos.',
      'not-allowed':    '🔒 Permiso de micrófono denegado. Hacé click en el candado del navegador y activá el micrófono.',
      'network':        '📶 Error de conexión. Revisá tu internet.',
      'aborted':        'Escucha cancelada.',
    };
    return map[code] || '🎧 No entendí bien. ¿Podés repetir?';
  }

  start() {
    if (!this.supported) {
      this.onError('Tu navegador no soporta reconocimiento de voz. Usá Chrome o Edge. 🎤');
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      // InvalidStateError: ya estaba escuchando, ignorar
      if (e.name !== 'InvalidStateError') {
        this.onError('Error al iniciar el micrófono: ' + e.message);
      }
    }
  }

  stop() {
    if (this.isListening && this.recognition) {
      try { this.recognition.stop(); } catch (_) {}
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  TextToSpeech — Síntesis de voz nativa del navegador
// ─────────────────────────────────────────────────────────────────────────────
class TextToSpeech {
  constructor(options = {}) {
    this.onSpeakStart = options.onSpeakStart || (() => {});
    this.onSpeakEnd   = options.onSpeakEnd   || (() => {});
    this.onError      = options.onError      || (() => {});

    this.supported = 'speechSynthesis' in window;
    if (!this.supported) {
      console.warn('[WacoCoach TTS] speechSynthesis no soportado.');
      return;
    }

    this.synth = window.speechSynthesis;
    this.isSpeaking = false;
    this.voice = null;

    // Cargar voces (puede ser asíncrono según el navegador)
    this._loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this._loadVoices();
    }
  }

  _loadVoices() {
    const voices = this.synth.getVoices();
    // Preferir voces de Google en español (mejor calidad)
    this.voice =
      voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('google')) ||
      voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('microsoft')) ||
      voices.find(v => v.lang.startsWith('es')) ||
      null;
  }

  async speak(text, options = {}) {
    if (!this.supported) {
      this.onError('Síntesis de voz no disponible. Mostrando texto.');
      return;
    }

    // Cancelar audio previo
    this.synth.cancel();

    // iOS requiere que el audio haya sido activado por un gesto del usuario
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      await this._iosAudioFix();
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang    = options.lang   || 'es-CO';
      utterance.rate    = options.rate   || 0.9;
      utterance.pitch   = options.pitch  || 1.0;
      utterance.volume  = options.volume || 1.0;

      if (this.voice) utterance.voice = this.voice;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.onSpeakStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.onSpeakEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        console.error('[WacoCoach TTS] Error:', e);
        this.onError('No pude leer la respuesta en voz alta. Leéla en pantalla. 👀');
        resolve(); // No bloquear la UI
      };

      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.supported) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  // iOS fix: el audio necesita ser desbloqueado con un gesto del usuario
  async _iosAudioFix() {
    if (window._wacoAudioUnlocked) return;
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      await audio.play().catch(() => {});
      window._wacoAudioUnlocked = true;
    } catch (_) {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  VoiceCoach — Integración con el chat existente de ai-coach.html
// ─────────────────────────────────────────────────────────────────────────────
class VoiceCoach {
  constructor() {
    this.isListening  = false;
    this.token        = localStorage.getItem('token');

    this._checkBrowserSupport();
    this._initServices();
    this._bindUI();

    console.log('[WacoCoach Voice] Inicializado. STT:', this.sttOk, '| TTS:', this.ttsOk);
  }

  _checkBrowserSupport() {
    this.sttOk = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    this.ttsOk = 'speechSynthesis' in window;

    const notice = document.getElementById('voiceSupportNotice');
    const micBtn = document.getElementById('micBtn');

    if (!this.sttOk || !this.ttsOk) {
      if (notice) {
        notice.style.display = 'block';
        notice.innerHTML =
          '⚠️ <strong>Tu navegador no soporta voz completa.</strong> ' +
          'Para usar el micrófono y escuchar las respuestas, usá ' +
          '<strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>. ' +
          'Podés seguir escribiendo normalmente. ✍️';
      }
      if (micBtn) {
        micBtn.disabled = true;
        micBtn.title = 'Voz no disponible — usá Chrome o Edge';
      }
    }
  }

  _initServices() {
    this.stt = new SpeechToText({
      lang: 'es-CO',
      onStart: () => this._setVoiceState('listening'),

      onTranscript: (text, isFinal) => {
        // Mostrar transcripción en tiempo real
        const liveEl = document.getElementById('liveTranscript');
        if (liveEl) {
          liveEl.textContent = '🎤 "' + text + '"';
          liveEl.classList.add('visible');
        }

        if (isFinal && text.trim()) {
          this.stt.stop();
          this._sendVoiceMessage(text.trim());
        }
      },

      onEnd: (finalText) => {
        const liveEl = document.getElementById('liveTranscript');
        if (liveEl) liveEl.classList.remove('visible');

        if (!finalText.trim() && this.isListening) {
          // Nada reconocido
          this._setVoiceState('idle');
          this.isListening = false;
        }
      },

      onError: (msg) => {
        this._setVoiceState('idle');
        this.isListening = false;
        // Mostrar el error en el chat usando la función global existente
        if (typeof addMessage === 'function') addMessage('ai', msg);
        else console.warn('[WacoCoach STT Error]', msg);
      },
    });

    this.tts = new TextToSpeech({
      onSpeakStart: () => this._setVoiceState('speaking'),
      onSpeakEnd:   () => this._setVoiceState('idle'),
      onError: (msg) => {
        this._setVoiceState('idle');
        console.warn('[WacoCoach TTS]', msg);
      },
    });
  }

  _bindUI() {
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => this._toggleListen());
    }

    // Detener el audio si el usuario empieza a escribir
    const input = document.getElementById('messageInput');
    if (input) {
      input.addEventListener('keydown', () => {
        if (this.tts?.isSpeaking) this.tts.stop();
      });
    }
  }

  _toggleListen() {
    if (!this.sttOk) return;
    if (this.isListening) {
      this.stt.stop();
      this.isListening = false;
      this._setVoiceState('idle');
    } else {
      this.isListening = true;
      this.stt.start();
    }
  }

  async _sendVoiceMessage(text) {
    this.isListening = false;
    this._setVoiceState('thinking');

    // Usar la función global `addMessage` que ya existe en ai-coach.html
    if (typeof addMessage === 'function') addMessage('user', text);

    // Mostrar indicador de escritura
    if (typeof showTyping === 'function') showTyping(true);

    try {
      const res = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.token,
        },
        body: JSON.stringify({ text }),
      });

      if (typeof showTyping === 'function') showTyping(false);

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || 'Error procesando tu consulta. ¿Podés intentar de nuevo? 🔄';
        if (typeof addMessage === 'function') addMessage('ai', errMsg);
        this._setVoiceState('idle');
        return;
      }

      // Mostrar respuesta en el chat
      if (typeof addMessage === 'function') addMessage('ai', data.text);

      // Leer la respuesta en voz alta
      if (this.ttsOk && this.tts) {
        await this.tts.speak(data.text);
      } else {
        this._setVoiceState('idle');
      }

      // Actualizar contador de uso (función ya existente)
      if (typeof loadUsage === 'function') loadUsage();

    } catch (err) {
      if (typeof showTyping === 'function') showTyping(false);
      console.error('[WacoCoach Voice] Error de red:', err);
      const errMsg = '❌ Error de conexión. Revisá tu internet. 📶';
      if (typeof addMessage === 'function') addMessage('ai', errMsg);
      this._setVoiceState('idle');
    }
  }

  _setVoiceState(state) {
    const micBtn  = document.getElementById('micBtn');
    const statusEl = document.getElementById('voiceStatus');

    const iconMap = { idle: '🎤', listening: '🔴', thinking: '💭', speaking: '🔊' };
    const labelMap = {
      idle:      '🎤 Listo',
      listening: '🎤 Escuchando...',
      thinking:  '💭 Pensando...',
      speaking:  '🔊 Hablando...',
    };

    if (micBtn) {
      micBtn.classList.remove('idle', 'listening', 'thinking', 'speaking');
      micBtn.classList.add(state);
      micBtn.textContent = iconMap[state] || '🎤';
      micBtn.title = labelMap[state] || '';
    }

    if (statusEl) {
      statusEl.textContent = labelMap[state] || '';
      statusEl.className = state === 'idle' ? '' : state;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Inicializar cuando el DOM esté listo
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar en el panel de chat
  if (document.getElementById('micBtn')) {
    window.wacoVoice = new VoiceCoach();
  }
});
