import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedRecipes() {
  console.log('🍳 Sembrando recetas profesionales...')

  const recipes = [
    {
      name: 'Bowl de Avena y Proteína',
      description: 'Un desayuno equilibrado y rápido para empezar el día con energía.',
      prepTimeMinutes: 5,
      cookTimeMinutes: 5,
      servings: 1,
      difficultyLevel: 'beginner',
      caloriesPerServing: 420,
      proteinPerServing: 35,
      carbsPerServing: 45,
      fatPerServing: 10,
      isPublic: true,
      isVerified: true
    },
    {
      name: 'Pollo al Curry con Quinoa',
      description: 'Proteína magra con especias antiinflamatorias y carbohidratos de bajo índice glucémico.',
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      servings: 2,
      difficultyLevel: 'intermediate',
      caloriesPerServing: 550,
      proteinPerServing: 45,
      carbsPerServing: 50,
      fatPerServing: 15,
      isPublic: true,
      isVerified: true
    }
  ]

  const difficulties = ['beginner', 'intermediate', 'advanced']
  for (let i = recipes.length; i < 200; i++) {
    recipes.push({
      name: `Receta Fitness Pro ${i + 1}`,
      description: 'Una opción nutritiva diseñada por expertos para optimizar tu composición corporal.',
      prepTimeMinutes: 10 + (i % 20),
      cookTimeMinutes: 15 + (i % 30),
      servings: (i % 4) + 1,
      difficultyLevel: difficulties[i % difficulties.length],
      caloriesPerServing: 300 + (i % 400),
      proteinPerServing: 20 + (i % 30),
      carbsPerServing: 30 + (i % 50),
      fatPerServing: 5 + (i % 20),
      isPublic: true,
      isVerified: true
    } as any)
  }

  for (let i = 0; i < recipes.length; i += 50) {
    const batch = recipes.slice(i, i + 50)
    await prisma.recipe.createMany({
      data: batch,
      skipDuplicates: true
    })
  }

  console.log(`✅ ${recipes.length} recetas sembradas exitosamente.`)
}
