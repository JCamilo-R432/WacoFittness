/**
 * WacoPro Fitness API - Professional Frontend
 * Fully Functional with Debugging
 */

console.log('🔍 index.js cargado - Iniciando...');

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOMContentLoaded - DOM listo');
  
  // Verificar elementos críticos
  const responseContainer = document.getElementById('response-container');
  const responseContent = document.getElementById('response-content');
  
  console.log('📊 response-container:', responseContainer ? 'Encontrado' : 'NO encontrado');
  console.log('📊 response-content:', responseContent ? 'Encontrado' : 'NO encontrado');
  
  // Contar botones de endpoints
  const endpointButtons = document.querySelectorAll('.endpoint-card');
  console.log(`🔘 Botones de endpoint encontrados: ${endpointButtons.length}`);

  // Inicializar animaciones
  initializeAnimations();

  console.log('✅ Inicialización completada');
});

/**
 * Función para probar endpoints
 * @param {string} method - GET, POST, PUT, DELETE
 * @param {string} endpoint - Ruta de la API
 * @param {object} body - Datos a enviar (opcional)
 * @param {boolean} requiresAuth - Si requiere token JWT
 */
window.testEndpoint = async function(method, endpoint, body = null, requiresAuth = false) {
  console.log('🎯 testEndpoint llamado con:', { method, endpoint, body, requiresAuth });

  const container = document.getElementById('response-container');
  const content = document.getElementById('response-content');

  if (!container || !content) {
    console.error('❌ Error: Elementos de respuesta no encontrados');
    return;
  }

  // Mostrar contenedor y estado de carga
  container.style.display = 'block';
  content.textContent = '⏳ Procesando petición a ' + endpoint + '...';
  content.className = 'bg-black/50 p-4 rounded-lg overflow-x-auto font-mono text-sm text-cyan-400 max-h-96';

  // Scroll suave al contenedor de respuesta
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });

  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token adjuntado');
      } else {
        console.warn('⚠️ Esta ruta requiere autenticación pero no se encontró un token.');
      }
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    console.log('📡 Enviando fetch...');
    const response = await fetch(endpoint, options);

    console.log('📥 Respuesta recibida:', response.status);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`El servidor no retornó JSON.\nStatus: ${response.status}\nRespuesta: ${text.substring(0, 300)}`);
    }

    const data = await response.json();

    // Guardar token si es login
    if (endpoint.includes('/auth/login') && data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      console.log('✅ Token guardado en localStorage');
    }

    // Formatear JSON para mostrar
    content.textContent = JSON.stringify(data, null, 2);

    // Cambiar color según éxito
    if (response.ok) {
      content.className = 'bg-black/50 p-4 rounded-lg overflow-x-auto font-mono text-sm text-green-400 max-h-96';
    } else {
      content.className = 'bg-black/50 p-4 rounded-lg overflow-x-auto font-mono text-sm text-red-400 max-h-96';
    }

  } catch (error) {
    console.error('❌ Error en el fetch:', error);
    content.textContent = 'ERROR DE RED O SERVIDOR:\n' + error.message;
    content.className = 'bg-black/50 p-4 rounded-lg overflow-x-auto font-mono text-sm text-red-500 max-h-96';
  }
};

window.closeResponse = function() {
  const container = document.getElementById('response-container');
  if (container) container.style.display = 'none';
};

function initializeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-10');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .endpoint-group').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
    observer.observe(el);
  });
}
