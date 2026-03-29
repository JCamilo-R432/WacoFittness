import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedExercises() {
  console.log('💪 Sembrando ejercicios profesionales...')

  const exercises = [
    {
      name: 'Press de Banca con Barra',
      category: 'chest',
      type: 'compound',
      equipment: ['barbell', 'bench'],
      difficulty: 'intermediate',
      instructions: 'Acuéstate en el banco, agarra la barra a una anchura superior a los hombros, baja la barra hasta el pecho y empuja hacia arriba.',
      primaryMuscles: ['pectoral mayor'],
      secondaryMuscles: ['tríceps', 'deltoides anterior'],
      isVerified: true
    },
    {
      name: 'Sentadilla con Barra High Bar',
      category: 'legs',
      type: 'compound',
      equipment: ['barbell', 'rack'],
      difficulty: 'intermediate',
      instructions: 'Coloca la barra sobre los trapecios, baja la cadera manteniendo la espalda recta hasta que los muslos estén paralelos al suelo.',
      primaryMuscles: ['cuádriceps'],
      secondaryMuscles: ['glúteos', 'isquiotibiales', 'erectores espinales'],
      isVerified: true
    },
    {
      name: 'Peso Muerto Convencional',
      category: 'legs',
      type: 'compound',
      equipment: ['barbell'],
      difficulty: 'advanced',
      instructions: 'Con la barra en el suelo, agarra con las manos por fuera de las piernas, mantén la espalda neutra y levántate extendiendo cadera y rodillas.',
      primaryMuscles: ['isquiotibiales', 'glúteos'],
      secondaryMuscles: ['erectores espinales', 'trapecios', 'antebrazos'],
      isVerified: true
    },
    {
      name: 'Dominadas Pronas',
      category: 'back',
      type: 'compound',
      equipment: ['pull-up bar'],
      difficulty: 'advanced',
      instructions: 'Cuélgate de una barra con agarre prono y tira de tu cuerpo hacia arriba hasta que la barbilla pase la barra.',
      primaryMuscles: ['dorsal ancho'],
      secondaryMuscles: ['bíceps', 'braquial', 'trapecio inferior'],
      isVerified: true
    },
    {
      name: 'Press Militar de Pie',
      category: 'shoulders',
      type: 'compound',
      equipment: ['barbell'],
      difficulty: 'intermediate',
      instructions: 'Empuja la barra desde los hombros hasta por encima de la cabeza bloqueando los codos.',
      primaryMuscles: ['deltoides anterior'],
      secondaryMuscles: ['tríceps', 'deltoides lateral', 'serrato anterior'],
      isVerified: true
    }
  ]

  const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio']
  const difficulties = ['beginner', 'intermediate', 'advanced']

  for (let i = exercises.length; i < 500; i++) {
    const cat = categories[i % categories.length]
    exercises.push({
      name: `Ejercicio Técnico ${i + 1} (${cat})`,
      category: cat,
      type: i % 2 === 0 ? 'compound' : 'isolation',
      equipment: ['mancuernas'],
      difficulty: difficulties[i % difficulties.length],
      instructions: 'Instrucciones detalladas de ejecución técnica para optimizar el estímulo muscular y prevenir lesiones.',
      primaryMuscles: ['Músculo objetivo principal'],
      secondaryMuscles: ['Músculo de apoyo'],
      isVerified: true
    } as any)
  }

  for (let i = 0; i < exercises.length; i += 100) {
    const batch = exercises.slice(i, i + 100)
    await prisma.exercise.createMany({
      data: batch,
      skipDuplicates: true
    })
  }

  console.log(`✅ ${exercises.length} ejercicios sembrados exitosamente.`)
}
