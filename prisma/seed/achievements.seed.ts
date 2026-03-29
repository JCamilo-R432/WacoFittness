// prisma/seed/achievements.seed.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedAchievements() {
  console.log('🏆 Sembrando logros profesionales...')
  
  // Crear usuario del sistema para logros template
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@wacopro.com' },
    update: {},
    create: {
      email: 'system@wacopro.com',
      password: 'system_password_do_not_use',
      name: 'WacoPro System'
      // ✅ isActive NO se especifica - usa el default(true) del schema
    }
  })
  
  console.log(`✅ Usuario del sistema creado: ${systemUser.id}`)
  
  // Definir logros - SIN el campo 'level' (no existe en el schema)
  const achievements = [
    // Nutrición
    {
      userId: systemUser.id,
      type: 'nutrition',
      title: 'Primer Registro',
      description: 'Registra tu primera comida',
      icon: '🍎'
    },
    {
      userId: systemUser.id,
      type: 'nutrition',
      title: 'Semana Completa',
      description: 'Registra comidas por 7 días consecutivos',
      icon: '📅'
    },
    {
      userId: systemUser.id,
      type: 'nutrition',
      title: 'Maestro de Macros',
      description: 'Alcanza tus macros objetivo por 30 días',
      icon: '🎯'
    },
    
    // Entrenamiento
    {
      userId: systemUser.id,
      type: 'training',
      title: 'Primer Entrenamiento',
      description: 'Completa tu primer workout',
      icon: '💪'
    },
    {
      userId: systemUser.id,
      type: 'training',
      title: 'Récord Personal',
      description: 'Establece un nuevo PR en cualquier ejercicio',
      icon: '🏋️'
    },
    {
      userId: systemUser.id,
      type: 'training',
      title: 'Constancia de Acero',
      description: 'Entrena 30 días consecutivos',
      icon: '🔥'
    },
    
    // Hidratación
    {
      userId: systemUser.id,
      type: 'hydration',
      title: 'Hidratado',
      description: 'Alcanza tu meta de agua por 7 días',
      icon: '💧'
    },
    {
      userId: systemUser.id,
      type: 'hydration',
      title: 'Maestro del Agua',
      description: 'Alcanza tu meta por 30 días consecutivos',
      icon: '🌊'
    },
    
    // Descanso
    {
      userId: systemUser.id,
      type: 'recovery',
      title: 'Dormilón',
      description: 'Duerme 8+ horas por 7 días',
      icon: '😴'
    },
    {
      userId: systemUser.id,
      type: 'recovery',
      title: 'Recuperación Perfecta',
      description: 'Score de recuperación >90 por 14 días',
      icon: '⚡'
    },
    
    // Suplementos
    {
      userId: systemUser.id,
      type: 'supplements',
      title: 'Suplementado',
      description: 'Registra suplementos por 30 días',
      icon: '💊'
    },
    
    // Compras
    {
      userId: systemUser.id,
      type: 'shopping',
      title: 'Comprador Inteligente',
      description: 'Completa 10 listas de compras',
      icon: '🛒'
    },
    
    // Milestones
    {
      userId: systemUser.id,
      type: 'milestone',
      title: 'Primeros 7 Días',
      description: 'Usa la app por una semana',
      icon: '🎉'
    },
    {
      userId: systemUser.id,
      type: 'milestone',
      title: 'Un Mes',
      description: 'Usa la app por 30 días',
      icon: '🏆'
    },
    {
      userId: systemUser.id,
      type: 'milestone',
      title: 'Experto WacoPro',
      description: 'Usa la app por 90 días',
      icon: '👑'
    }
  ]
  
  // Insertar logros - SIN el campo 'level'
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement  // ✅ AGREGAR "data:"
    })
  }
}