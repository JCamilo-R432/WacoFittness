import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inserting predefined recipes...');

    let admin = await prisma.user.findFirst();
    if (!admin) {
        admin = await prisma.user.create({
            data: { email: 'admin_recipe@gym.com', password: 'hash', name: 'Admin Recipes' }
        });
    }

    const recipes = [];

    // Generating 100 mockup fast recipes
    for (let i = 1; i <= 100; i++) {
        const isKeto = i % 5 === 0;
        const isVegan = i % 7 === 0;
        const difficulty = i % 3 === 0 ? 'dificil' : (i % 2 === 0 ? 'medio' : 'facil');

        recipes.push({
            creatorId: admin.id,
            name: `Receta Saludable #${i} ${isKeto ? '(Keto)' : ''} ${isVegan ? '(Vegan)' : ''}`,
            description: `Una increíble receta predefinida nro ${i}`,
            prepTimeMinutes: Math.floor(Math.random() * 30) + 5,
            cookTimeMinutes: Math.floor(Math.random() * 60) + 0,
            servings: Math.floor(Math.random() * 4) + 1,
            difficultyLevel: difficulty,
            caloriesPerServing: Math.floor(Math.random() * 800) + 200,
            proteinPerServing: Math.floor(Math.random() * 60) + 10,
            carbsPerServing: isKeto ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 100) + 20,
            fatPerServing: Math.floor(Math.random() * 40) + 5,
            fiberPerServing: Math.floor(Math.random() * 15) + 1,
            isPublic: true,
            isVerified: true,
            tags: {
                create: [
                    { tag: isKeto ? 'keto' : 'estandar' },
                    { tag: isVegan ? 'vegan' : 'omnivoro' }
                ]
            },
            instructions: {
                create: [
                    { stepNumber: 1, instruction: 'Precalentar el horno a 180 grados.' },
                    { stepNumber: 2, instruction: 'Mezclar los ingredientes en un bowl.' },
                    { stepNumber: 3, instruction: 'Hornear por el tiempo estimado y servir.' }
                ]
            }
        });
    }

    for (const r of recipes) {
        await prisma.recipe.create({ data: r });
    }

    console.log('Seeder de 100 Recetas Terminado.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
