import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedHydrationChallenges() {
  console.log('💧 Sembrando desafíos de hidratación...')

  const challenges = [
    {
      name: '7 Días de Hidratación Consciente',
      description: 'Alcanza tu meta diaria de agua durante una semana completa para mejorar tu energía y piel.',
      durationDays: 7,
      dailyGoalMl: 2500,
      isPredefined: true,
      isActive: true
    },
    {
      name: 'Reto de 30 Días: Hábito Acuático',
      description: 'Establece el hábito definitivo de beber suficiente agua durante un mes entero.',
      durationDays: 30,
      dailyGoalMl: 3000,
      isPredefined: true,
      isActive: true
    },
    {
      name: 'Hidratación Pre-Entreno',
      description: 'Asegúrate de beber al menos 500ml de agua 1 hora antes de cada entrenamiento por 15 días.',
      durationDays: 15,
      dailyGoalMl: 2000,
      isPredefined: true,
      isActive: true
    }
  ]

  for (let i = challenges.length; i < 10; i++) {
    challenges.push({
      name: `Desafío de Hidratación Pro ${i + 1}`,
      description: 'Un desafío diseñado para optimizar tu rendimiento físico mediante una hidratación celular adecuada.',
      durationDays: 7 + (i * 2),
      dailyGoalMl: 2200 + (i * 100),
      isPredefined: true,
      isActive: true
    })
  }

  for (const challenge of challenges) {
    await prisma.hydrationChallenge.create({
      data: challenge
    })
  }

  console.log(`✅ ${challenges.length} desafíos de hidratación sembrados.`)
}
