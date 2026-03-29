import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedRelaxationTechniques() {
  console.log('🧘 Sembrando técnicas de relajación profesionales...')

  const techniques = [
    {
      name: 'Respiración 4-7-8',
      category: 'breathing',
      durationMinutes: 5,
      difficulty: 'beginner',
      instructions: 'Inhala por 4 segundos, mantén 7, exhala 8. Repite 4 veces.',
      benefits: ['Reduce ansiedad', 'Mejora la conciliación del sueño'],
      bestFor: ['preSleep', 'stressRelief'],
      isVerified: true
    },
    {
      name: 'Escaneo Corporal (Body Scan)',
      category: 'bodyScan',
      durationMinutes: 15,
      difficulty: 'intermediate',
      instructions: 'Recuéstate y enfoca tu atención en cada parte del cuerpo, desde los pies hasta la cabeza, liberando tensión.',
      benefits: ['Conexión mente-cuerpo', 'Relajación muscular profunda'],
      bestFor: ['postWorkout', 'recovery'],
      isVerified: true
    }
  ]

  const categories = ['breathing', 'meditation', 'bodyScan', 'visualization', 'mindfulness']
  for (let i = techniques.length; i < 50; i++) {
    const cat = categories[i % categories.length]
    techniques.push({
      name: `Técnica de Relajación ${i + 1} (${cat})`,
      category: cat,
      durationMinutes: 5 + (i % 25),
      difficulty: i % 3 === 0 ? 'beginner' : 'intermediate',
      instructions: 'Sigue los pasos guiados para alcanzar un estado de calma profunda y recuperación mental.',
      benefits: ['Reducción de cortisol', 'Mejora del enfoque'],
      bestFor: ['stressRelief'],
      isVerified: true
    } as any)
  }

  for (let i = 0; i < techniques.length; i += 25) {
    const batch = techniques.slice(i, i + 25)
    await prisma.relaxationTechnique.createMany({
      data: batch,
      skipDuplicates: true
    })
  }

  console.log(`✅ ${techniques.length} técnicas de relajación sembradas.`)
}
