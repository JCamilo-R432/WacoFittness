// ── WacoCoach Exercise Library — JSON estático (sin LLM) ──────────────────
// El LLM NO genera datos de ejercicios. Los datos vienen de aquí.
// El LLM solo humaniza la información con lenguaje natural.

export interface Exercise {
  id: string;
  nombre: string;
  nombreEn: string;
  musculos: string[];
  musculosSecundarios: string[];
  equipamiento: string[];
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  tipo: 'compuesto' | 'aislamiento' | 'cardio' | 'movilidad';
  tecnica: string[];
  errores_comunes: Array<{ error: string; solucion: string }>;
  progresiones: string[];
  regresiones: string[];
  variaciones?: string[];
  respiracion: string;
  seguridad: string;
}

export const exercises: Exercise[] = [
  {
    id: 'sentadilla',
    nombre: 'Sentadilla con barra',
    nombreEn: 'Back Squat',
    musculos: ['cuádriceps', 'glúteos', 'isquiotibiales'],
    musculosSecundarios: ['core', 'erector spinae', 'pantorrillas'],
    equipamiento: ['barra', 'rack'],
    nivel: 'intermedio',
    tipo: 'compuesto',
    tecnica: [
      'Pies al ancho de hombros, puntas ligeramente hacia afuera (15-30°)',
      'Barra sobre trapecios (high bar) o espalda media (low bar)',
      'Espalda neutra, pecho arriba, core braceado',
      'Iniciar movimiento enviando cadera hacia atrás y abajo',
      'Bajar controlado hasta muslos paralelos o por debajo',
      'Rodillas siguen la dirección de las puntas (NO colapsan hacia adentro)',
      'Empujar con talones para subir, torso estable',
    ],
    errores_comunes: [
      { error: 'Rodillas colapsan hacia adentro (valgo)', solucion: 'Activar glúteos, empujar rodillas afuera, usar banda elástica sobre rodillas para práctica' },
      { error: 'Espalda se redondea', solucion: 'Reducir peso, fortalecer core, revisar movilidad de cadera y tobillo, pecho arriba' },
      { error: 'Talones se levantan del suelo', solucion: 'Trabajar movilidad de tobillo, elevar talones con discos mientras mejora la movilidad' },
      { error: 'Barra se mueve hacia adelante', solucion: 'Mantener barra sobre medio pie, core braceado, bajar más controlado' },
    ],
    progresiones: [
      'Sentadilla con peso corporal',
      'Goblet squat con mancuerna/kettlebell',
      'Sentadilla con barra vacía',
      'Sentadilla con barra cargada',
    ],
    regresiones: [
      'Box squat (sentadilla en caja)',
      'Sentadilla asistida (TRX o marco de puerta)',
      'Sentadilla parcial con rango reducido',
    ],
    variaciones: ['sentadilla goblet', 'sentadilla búlgara', 'sentadilla frontal', 'leg press'],
    respiracion: 'Inhalar y bracear antes de bajar, aguantar durante el descenso, exhalar al subir',
    seguridad: 'Usar seguros en la barra. Tener spotter para pesos pesados. NO rebotar en el fondo del movimiento.',
  },
  {
    id: 'peso_muerto',
    nombre: 'Peso muerto convencional',
    nombreEn: 'Conventional Deadlift',
    musculos: ['isquiotibiales', 'glúteos', 'erector spinae'],
    musculosSecundarios: ['trapecios', 'dorsales', 'cuádriceps', 'core', 'antebrazos'],
    equipamiento: ['barra', 'discos'],
    nivel: 'intermedio',
    tipo: 'compuesto',
    tecnica: [
      'Barra sobre medio pie (línea de cordones), a ~3 cm de las espinillas',
      'Pies al ancho de caderas, puntas ligeramente hacia afuera',
      'Agarre justo fuera de las rodillas (doble prono o mixto)',
      'Bajar cadera hasta que espinillas toquen la barra',
      'Espalda NEUTRA, pecho arriba, hombros sobre o ligeramente adelante de la barra',
      'Respirar y bracear core (presión intra-abdominal)',
      'Empujar el suelo con los pies, extender cadera y rodillas simultáneamente',
      'Barra viaja cerca del cuerpo, rozando espinillas y muslos',
      'Bloquear con cadera y rodillas extendidas (NO hiperextender espalda)',
      'Bajar controlado: cadera hacia atrás primero',
    ],
    errores_comunes: [
      { error: 'Espalda baja redondeada', solucion: 'Reducir peso, practicar el braceo del core, fortalecer core, peso muerto rumano primero' },
      { error: 'Cadera sube primero (se transforma en good morning)', solucion: 'Bajar más la cadera al inicio, empujar suelo con piernas, barra debe subir con piernas y cadera juntas' },
      { error: 'La barra se aleja del cuerpo', solucion: 'Activar dorsales ("romper la barra"), mantener barra pegada a piernas, usar pantalón largo para evitar rozones' },
      { error: 'Hiperextensión en el bloqueo', solucion: 'Solo pararse derecho, NO echarse hacia atrás, apretar glúteos sin mover columna' },
    ],
    progresiones: [
      'Peso muerto con kettlebell',
      'Peso muerto con barra hexagonal (trap bar)',
      'Peso muerto rumano (para técnica de bisagra)',
      'Peso muerto convencional con barra vacía',
    ],
    regresiones: [
      'Peso muerto desde bloques (rango reducido)',
      'Peso muerto rumano con mancuernas',
      'Puente de glúteos en el suelo',
    ],
    variaciones: ['peso muerto rumano', 'peso muerto sumo', 'trap bar deadlift', 'rack pulls'],
    respiracion: 'Inhalar y bracear antes de levantar, aguantar durante el levantamiento, exhalar arriba o al bajar',
    seguridad: 'NUNCA levantar con espalda redondeada. Usar cinturón para pesos cercanos al máximo. NO hacer rebote en el suelo.',
  },
  {
    id: 'press_banca',
    nombre: 'Press de banca con barra',
    nombreEn: 'Barbell Bench Press',
    musculos: ['pectoral mayor', 'tríceps'],
    musculosSecundarios: ['deltoides anterior', 'serrato anterior'],
    equipamiento: ['barra', 'banco', 'rack'],
    nivel: 'principiante',
    tipo: 'compuesto',
    tecnica: [
      'Acostado en banca, ojos debajo de la barra',
      'Pies planos en el suelo (NO levantados)',
      'Agarre ligeramente más ancho que hombros',
      'Retraer escápulas (juntar omóplatos), crear arco natural lumbar',
      'Desenganchar barra, posicionar sobre pecho/clavícula',
      'Bajar controlado hasta tocar pecho (línea de pezones)',
      'Codos a 45-75° del torso (NO completamente abiertos a 90°)',
      'Empujar barra hacia arriba y ligeramente hacia la cara',
      'Bloquear codos arriba sin despegar escápulas del banco',
    ],
    errores_comunes: [
      { error: 'Codos completamente abiertos a 90°', solucion: 'Cerrar codos a 45-60°; protege hombros y activa más pectoral' },
      { error: 'Barra rebota en el pecho', solucion: 'Controlar el descenso (2-3 segundos), tocar suavemente y empujar' },
      { error: 'Cadera se levanta del banco', solucion: 'Mantener glúteos en contacto; el arco lumbar no implica levantar cadera' },
      { error: 'Muñecas dobladas hacia atrás', solucion: 'Mantener muñecas neutras; la barra sobre la base de la palma, no los dedos' },
    ],
    progresiones: [
      'Flexiones de pecho',
      'Press con mancuernas',
      'Press de banca con barra vacía',
      'Press de banca cargado progresivamente',
    ],
    regresiones: [
      'Floor press (desde el suelo, rango limitado)',
      'Press de banca con agarre más ancho (reduce rango)',
      'Press con banda de resistencia',
    ],
    variaciones: ['press inclinado', 'press declinado', 'press con mancuernas', 'fondos en paralelas'],
    respiracion: 'Inhalar al bajar la barra, exhalar al empujar hacia arriba',
    seguridad: 'Usar seguros en la barra. Tener spotter para pesos pesados. NO rebotar la barra en el pecho.',
  },
  {
    id: 'press_militar',
    nombre: 'Press militar con barra',
    nombreEn: 'Overhead Press (OHP)',
    musculos: ['deltoides anterior y lateral', 'tríceps'],
    musculosSecundarios: ['trapecio superior', 'serrato anterior', 'core'],
    equipamiento: ['barra'],
    nivel: 'intermedio',
    tipo: 'compuesto',
    tecnica: [
      'De pie, pies al ancho de caderas',
      'Barra en posición frontal sobre clavículas/deltoides',
      'Agarre ligeramente más ancho que hombros',
      'Core braceado y glúteos apretados (evitar arco lumbar)',
      'Empujar barra verticalmente hacia arriba',
      'Cabeza retrocede ligeramente para dejar pasar la barra',
      'Bloquear codos arriba con barra sobre línea de hombros',
      'Bajar controlado a posición inicial',
    ],
    errores_comunes: [
      { error: 'Arco lumbar excesivo al presionar', solucion: 'Apretar glúteos y core, reducir peso, no inclinar torso hacia atrás' },
      { error: 'Barra se va hacia adelante en la trayectoria', solucion: 'Mantener barra cerca de la cara, codos deben quedar debajo de la barra' },
      { error: 'No hay bloqueo completo arriba', solucion: 'Bloquear codos completamente para activación completa de deltoides' },
    ],
    progresiones: [
      'Press militar con mancuernas sentado',
      'Press militar con barra vacía de pie',
      'Press militar cargado progresivamente',
    ],
    regresiones: [
      'Press Arnold con mancuernas (rango de movimiento rico)',
      'Elevaciones laterales (fortalecer deltoides)',
      'Press en máquina guiada',
    ],
    variaciones: ['press Arnold', 'press con mancuernas', 'push press (con impulso de piernas)', 'landmine press'],
    respiracion: 'Inhalar y bracear antes de empujar, exhalar al subir la barra',
    seguridad: 'NO hacer con dolor activo de hombro. Mantener core activo siempre para proteger espalda baja.',
  },
  {
    id: 'dominadas',
    nombre: 'Dominadas (pull-ups)',
    nombreEn: 'Pull-ups',
    musculos: ['dorsal ancho', 'bíceps'],
    musculosSecundarios: ['romboides', 'trapecio inferior', 'teres mayor', 'core'],
    equipamiento: ['barra de dominadas'],
    nivel: 'intermedio',
    tipo: 'compuesto',
    tecnica: [
      'Agarre prono (palmas afuera) al ancho de hombros o más amplio',
      'Colgado con brazos completamente extendidos (dead hang)',
      'Iniciar deprimiendo las escápulas (bajar hombros)',
      'Tirar con los codos hacia abajo y atrás, no solo con los bíceps',
      'Llevar pecho a la barra (no solo la barbilla)',
      'Bajar controlado hasta extensión completa de brazos',
    ],
    errores_comunes: [
      { error: 'Solo subir la barbilla (rango incompleto)', solucion: 'Llevar pecho a la barra y bajar hasta extensión completa; más músculo activado' },
      { error: 'Balanceo del cuerpo (kipping excesivo)', solucion: 'Hacer dominadas estrictas; el kipping es específico de CrossFit competitivo' },
      { error: 'Hombros suben hacia las orejas', solucion: 'Deprimir escápulas antes y durante el tirón; hombros lejos de las orejas' },
    ],
    progresiones: [
      'Dead hang (colgado pasivo para fuerza de agarre)',
      'Remo invertido bajo barra',
      'Dominadas asistidas con banda elástica',
      'Dominadas negativas (solo fase de bajada controlada)',
      'Dominadas completas',
    ],
    regresiones: [
      'Jalón al pecho en polea',
      'Remo con mancuerna',
      'Dominadas en máquina asistida',
    ],
    variaciones: ['chin-ups (agarre supino)', 'dominadas con peso (dip belt)', 'archer pull-up', 'L-sit pull-up'],
    respiracion: 'Exhalar al subir (fase concéntrica), inhalar al bajar controlado',
    seguridad: 'NO soltar la barra de golpe al final. Controlar siempre el descenso. Si hay dolor de codo o hombro, detener.',
  },
  {
    id: 'remo_barra',
    nombre: 'Remo con barra',
    nombreEn: 'Barbell Row',
    musculos: ['dorsal ancho', 'romboides', 'trapecio medio'],
    musculosSecundarios: ['bíceps', 'deltoides posterior', 'erector spinae', 'core'],
    equipamiento: ['barra', 'discos'],
    nivel: 'intermedio',
    tipo: 'compuesto',
    tecnica: [
      'De pie, pies al ancho de caderas',
      'Inclinarse desde la cadera (no desde la espalda), torso ~45°',
      'Rodillas ligeramente flexionadas',
      'Agarre prono al ancho de hombros, brazos extendidos',
      'Tirar la barra hacia el abdomen bajo/ombligo',
      'Codos cerca del cuerpo y hacia atrás (NO hacia los lados)',
      'Retraer escápulas en la posición alta',
      'Bajar controlado a posición colgante',
    ],
    errores_comunes: [
      { error: 'Espalda redondeada', solucion: 'Mantener espalda neutra, reducir peso, fortalecer core' },
      { error: 'Impulso con las piernas (cheat row)', solucion: 'Mantener torso estático, reducir peso y controlar el movimiento' },
      { error: 'Tirar hacia el pecho en vez del abdomen', solucion: 'Enfocarse en llevar codos hacia atrás, no en tirar con las manos' },
    ],
    progresiones: [
      'Remo con mancuerna a una mano',
      'Remo con barra vacía',
      'Remo con barra cargado',
    ],
    regresiones: [
      'Remo en máquina con pecho apoyado',
      'Face pull en polea',
      'Remo con banda elástica',
    ],
    variaciones: ['remo Pendlay', 'remo supino (palmas arriba)', 'remo T-bar', 'remo en cable'],
    respiracion: 'Inhalar al bajar la barra, exhalar al tirar hacia el abdomen',
    seguridad: 'Mantener espalda neutra siempre. NUNCA levantar con espalda redondeada ni con impulso excesivo.',
  },
  {
    id: 'plancha',
    nombre: 'Plancha (plank)',
    nombreEn: 'Plank',
    musculos: ['core (transverso abdominal)', 'recto abdominal'],
    musculosSecundarios: ['glúteos', 'deltoides', 'erector spinae'],
    equipamiento: [],
    nivel: 'principiante',
    tipo: 'aislamiento',
    tecnica: [
      'Cuerpo recto de cabeza a talones (sin sacar el trasero)',
      'Codos bajo los hombros, antebrazos apoyados en el suelo',
      'Apretar glúteos y contraer el abdomen activamente',
      'Respiración normal (no aguantar el aliento)',
      'Cuello neutro (mirar al suelo, no al frente)',
    ],
    errores_comunes: [
      { error: 'Trasero muy alto', solucion: 'Bajar las caderas hasta línea recta; descansar si no se puede mantener la posición' },
      { error: 'Espalda baja caída (lordosis excesiva)', solucion: 'Contraer más abdomen y glúteos activamente' },
      { error: 'Aguantar la respiración', solucion: 'Respirar normal; la tensión viene de los músculos activos, no de aguantar el aliento' },
    ],
    progresiones: [
      'Plancha con rodillas apoyadas',
      'Plancha estándar sobre antebrazos',
      'Plancha con elevación alterna de pierna',
      'Plancha con desplazamiento lateral',
      'Plancha en push-up con toques de hombro',
    ],
    regresiones: [
      'Plancha con manos elevadas en un banco',
      'Plancha con rodillas apoyadas',
      'Dead bug (para activación de core sin carga)',
    ],
    variaciones: ['plancha lateral', 'plancha con rotación', 'hollow body', 'plank to downward dog'],
    respiracion: 'Respiración diafragmática constante durante toda la duración',
    seguridad: 'Detener si hay dolor en la espalda baja; reducir el tiempo y corregir la posición antes de aumentar duración.',
  },
  {
    id: 'hip_thrust',
    nombre: 'Hip thrust',
    nombreEn: 'Hip Thrust',
    musculos: ['glúteo mayor'],
    musculosSecundarios: ['isquiotibiales', 'cuádriceps', 'core', 'glúteo medio'],
    equipamiento: ['barra o mancuerna', 'banco'],
    nivel: 'principiante',
    tipo: 'compuesto',
    tecnica: [
      'Espalda apoyada en el banco a la altura de los omóplatos',
      'Pies al ancho de caderas, rodillas a 90° en posición alta',
      'Empujar con talones, extender caderas completamente arriba',
      'Contraer glúteos máximos en el punto más alto',
      'Bajar controlado sin que el trasero toque el suelo completamente',
    ],
    errores_comunes: [
      { error: 'No extender completamente las caderas', solucion: 'Buscar el lockout completo en cada repetición para máxima activación de glúteos' },
      { error: 'Hiperlordosis en la parte alta del movimiento', solucion: 'Mantener core braceado y pelvis en posición neutra arriba' },
      { error: 'Rodillas que se cierran durante el empuje', solucion: 'Usar banda de resistencia sobre las rodillas para activar abductores' },
    ],
    progresiones: [
      'Glute bridge en el suelo (sin banco)',
      'Hip thrust con peso corporal',
      'Hip thrust con mancuerna sobre el abdomen',
      'Hip thrust con barra',
    ],
    regresiones: [
      'Glute bridge bilateral en el suelo',
      'Glute bridge unilateral',
      'Sentadilla goblet para cadena posterior',
    ],
    variaciones: ['glute bridge', 'hip thrust con pausa 2 segundos', 'hip thrust con banda', 'single-leg hip thrust'],
    respiracion: 'Inhalar al bajar, exhalar con fuerza al extender las caderas arriba',
    seguridad: 'Asegurar que la barra esté bien acolchada (pad). Comenzar con poco peso hasta dominar la técnica.',
  },
  {
    id: 'flexiones',
    nombre: 'Flexiones de pecho',
    nombreEn: 'Push-ups',
    musculos: ['pectoral mayor', 'tríceps'],
    musculosSecundarios: ['deltoides anterior', 'serrato anterior', 'core'],
    equipamiento: [],
    nivel: 'principiante',
    tipo: 'compuesto',
    tecnica: [
      'Posición de plank, manos ligeramente más anchas que hombros',
      'Cuerpo en línea recta (cabeza, hombros, cadera, rodillas, tobillos)',
      'Core y glúteos apretados durante todo el movimiento',
      'Bajar cuerpo controlado hasta que el pecho esté a cm del suelo',
      'Codos a 45° del torso (NO completamente abiertos)',
      'Empujar hacia arriba hasta bloquear codos',
    ],
    errores_comunes: [
      { error: 'Cadera se hunde o se eleva en arco', solucion: 'Apretar core y glúteos; verificar la posición en un espejo lateral' },
      { error: 'Codos completamente abiertos (90°)', solucion: 'Cerrar codos a 45°; protege el hombro y activa mejor el pectoral' },
      { error: 'Rango de movimiento incompleto', solucion: 'Bajar hasta que el pecho casi toque el suelo, subir hasta bloquear codos' },
    ],
    progresiones: [
      'Flexiones de pared (vertical)',
      'Flexiones de rodillas en el suelo',
      'Flexiones inclinadas con manos elevadas',
      'Flexiones estándar',
      'Flexiones declinadas con pies elevados',
      'Archer push-up (asimétrico)',
    ],
    regresiones: [
      'Flexiones de pared',
      'Flexiones de rodillas',
      'Flexiones inclinadas en banco',
    ],
    variaciones: ['flexiones diamante (tríceps)', 'flexiones anchas (pecho)', 'pike push-up (hombros)', 'flexiones con palmada'],
    respiracion: 'Inhalar al bajar (fase excéntrica), exhalar al empujar hacia arriba',
    seguridad: 'Mantener cuerpo recto. NO dejar que la cadera se hunda. Si hay dolor de muñeca, usar puños o manoplas.',
  },
  {
    id: 'zancadas',
    nombre: 'Zancadas (lunges)',
    nombreEn: 'Lunges',
    musculos: ['cuádriceps', 'glúteos'],
    musculosSecundarios: ['isquiotibiales', 'core', 'pantorrillas'],
    equipamiento: [],
    nivel: 'principiante',
    tipo: 'compuesto',
    tecnica: [
      'De pie, pies al ancho de caderas',
      'Dar un paso largo hacia adelante',
      'Bajar hasta que ambas rodillas estén aproximadamente a 90°',
      'Rodilla delantera NO debe pasar la punta del pie',
      'Rodilla trasera casi toca (pero no toca) el suelo',
      'Torso erguido y core activo durante todo el movimiento',
      'Empujar con el pie delantero para volver a la posición inicial',
    ],
    errores_comunes: [
      { error: 'Rodilla delantera pasa la punta del pie', solucion: 'Dar un paso más largo; la tibial debe quedar aproximadamente vertical' },
      { error: 'Rodilla colapsa hacia adentro', solucion: 'Empujar rodilla hacia afuera alineada con el segundo dedo; activar glúteos' },
      { error: 'Torso se inclina excesivamente hacia adelante', solucion: 'Mantener pecho arriba y core activo; reducir peso si es necesario' },
    ],
    progresiones: [
      'Zancadas estáticas (sin caminar)',
      'Zancadas caminando',
      'Zancadas inversas (step back lunge)',
      'Zancadas búlgaras (split squat con pie trasero elevado)',
      'Zancadas con mancuernas o barra',
    ],
    regresiones: [
      'Zancadas asistidas (agarrarse de una silla o TRX)',
      'Zancadas parciales (rango reducido)',
      'Split squat estático sin movimiento',
    ],
    variaciones: ['reverse lunge', 'lateral lunge', 'curtsy lunge', 'zancadas en caminata'],
    respiracion: 'Inhalar al bajar la rodilla trasera, exhalar al empujar hacia arriba y volver',
    seguridad: 'Mantener rodilla alineada con el pie. NO dejar que la rodilla colapse. Superficie antideslizante.',
  },
];

// ── Búsqueda en la biblioteca ─────────────────────────────────────────────

export function searchExercise(query: string): Exercise | null {
  const q = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Match exacto por ID
  const byId = exercises.find(e => e.id === q.replace(/\s+/g, '_'));
  if (byId) return byId;

  // Tabla de aliases → id canónico
  const ALIASES: Record<string, string> = {
    squat: 'sentadilla', sentadilla: 'sentadilla', cuclillas: 'sentadilla',
    deadlift: 'peso_muerto', 'peso muerto': 'peso_muerto', 'peso-muerto': 'peso_muerto',
    bench: 'press_banca', 'press banca': 'press_banca', 'bench press': 'press_banca', pecho: 'press_banca',
    overhead: 'press_militar', 'press militar': 'press_militar', 'overhead press': 'press_militar', ohp: 'press_militar',
    'pull-up': 'dominadas', pullup: 'dominadas', 'pull up': 'dominadas', dominada: 'dominadas',
    'barbell row': 'remo_barra', remo: 'remo_barra', 'remo barra': 'remo_barra',
    plank: 'plancha', plancha: 'plancha',
    'hip thrust': 'hip_thrust', hipthrust: 'hip_thrust', gluteo: 'hip_thrust', gluteos: 'hip_thrust',
    'push-up': 'flexiones', 'push up': 'flexiones', pushup: 'flexiones', flexion: 'flexiones',
    lunge: 'zancadas', lunges: 'zancadas', zancada: 'zancadas',
  };

  for (const [alias, id] of Object.entries(ALIASES)) {
    if (q.includes(alias)) {
      return exercises.find(e => e.id === id) || null;
    }
  }

  // Match parcial por nombre (inglés o español)
  return exercises.find(e =>
    e.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
    e.nombreEn.toLowerCase().includes(q) ||
    e.musculos.some(m => m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) ||
    e.musculosSecundarios.some(m => m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)),
  ) || null;
}
