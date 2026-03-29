import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedStacks() {
  console.log('🏗️ Sembrando stacks de suplementos profesionales...')

  const stacks = [
    {
      name: 'Stack de Ganancia de Masa (Bulk)',
      description: 'Combinación optimizada para maximizar la síntesis proteica y la fuerza.',
      goal: 'muscleGain',
      experienceLevel: 'intermediate',
      monthlyCost: 120,
      isPredefined: true,
      isPublic: true
    },
    {
      name: 'Stack de Definición (Cut)',
      description: 'Enfocado en la preservación de masa muscular durante un déficit calórico.',
      goal: 'fatLoss',
      experienceLevel: 'intermediate',
      monthlyCost: 95,
      isPredefined: true,
      isPublic: true
    },
    {
      name: 'Stack de Rendimiento Endurance',
      description: 'Ideal para atletas de fondo que buscan mejorar su resistencia y recuperación.',
      goal: 'endurance',
      experienceLevel: 'advanced',
      monthlyCost: 80,
      isPredefined: true,
      isPublic: true
    }
  ]

  for (const stackData of stacks) {
    await prisma.supplementStack.create({
      data: stackData
    })
  }

  // Generar variaciones para llegar a 15+
  const goals = ['muscleGain', 'fatLoss', 'strength', 'endurance', 'health']
  for (let i = stacks.length; i < 15; i++) {
    await prisma.supplementStack.create({
      data: {
        name: `Stack Especializado ${i + 1}`,
        description: 'Una combinación estratégica de micronutrientes y suplementos base.',
        goal: goals[i % goals.length],
        experienceLevel: 'beginner',
        monthlyCost: 50 + (i * 5),
        isPredefined: true,
        isPublic: true
      }
    })
  }

  console.log(`✅ ${Math.max(15, stacks.length)} stacks de suplementos sembrados.`)
}
