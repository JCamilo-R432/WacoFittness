import { PrismaClient } from '@prisma/client'
import { seedFoods } from './seed/foods.seed'
import { seedExercises } from './seed/exercises.seed'
import { seedSupplements } from './seed/supplements.seed'
import { seedRecipes } from './seed/recipes.seed'
import { seedRelaxationTechniques } from './seed/relaxation.seed'
import { seedStacks } from './seed/stacks.seed'
import { seedNotificationTemplates } from './seed/notification-templates.seed'
import { seedHydrationChallenges } from './seed/hydration-challenges.seed'
import { seedAchievements } from './seed/achievements.seed'
import { seedStores } from './seed/stores.seed'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🚀 === INICIANDO CARGA PROFESIONAL DE DATOS (WACOPRO) ===\n')

  try {
    // El orden importa si hay dependencias, aunque aquí la mayoría son tablas base
    await seedFoods()
    await seedExercises()
    await seedSupplements()
    await seedRecipes()
    await seedRelaxationTechniques()
    await seedStacks()
    await seedNotificationTemplates()
    await seedHydrationChallenges()
    await seedAchievements()
    await seedStores()

    console.log('\n✅ TODOS LOS SEEDERS COMPLETADOS CON ÉXITO\n')

    // Resumen de carga
    const stats = {
      Alimentos: await prisma.foodItem.count(),
      Ejercicios: await prisma.exercise.count(),
      Suplementos: await prisma.supplement.count(),
      Recetas: await prisma.recipe.count(),
      Relajación: await prisma.relaxationTechnique.count(),
      Stacks: await prisma.supplementStack.count(),
      Plantillas_Notif: await prisma.notificationTemplate.count(),
      Desafíos_Hidra: await prisma.hydrationChallenge.count(),
      Logros: await prisma.achievement.count(),
      Tiendas: await prisma.store.count()
    }

    console.table(stats)

  } catch (error) {
    console.error('❌ Error crítico en el proceso de seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
