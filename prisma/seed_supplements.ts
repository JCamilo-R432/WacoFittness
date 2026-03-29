import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inserting predefined supplements...');

    const baseSupplements = [
        { name: 'Whey Protein Concentrate', cat: 'protein', serve: '30g', price: 30, ev: 'A' },
        { name: 'Creatine Monohydrate', cat: 'creatine', serve: '5g', price: 20, ev: 'A' },
        { name: 'BCAA 2:1:1', cat: 'aminoAcids', serve: '10g', price: 25, ev: 'C' }
    ];

    /* Simulating 100 insertions based on variations */
    for (let i = 0; i < 100; i++) {
        const base = baseSupplements[i % baseSupplements.length];
        await prisma.supplement.create({
            data: {
                name: `${base.name} v${i}`,
                category: base.cat,
                activeIngredients: [],
                servingSize: base.serve,
                servingsPerContainer: 30 + i,
                recommendedDosage: base.serve,
                timing: ['postWorkout'],
                benefits: ['recovery'],
                sideEffects: [],
                contraindications: [],
                interactions: [],
                evidenceLevel: base.ev,
                averagePrice: base.price + i,
                pricePerServing: (base.price + i) / (30 + i)
            }
        });
    }

    console.log('Inserting 10 predefined stacks...');
    const goals = ['muscleGain', 'fatLoss', 'health'];
    for (let i = 0; i < 10; i++) {
        await prisma.supplementStack.create({
            data: {
                name: `Stack Auto ${i}`,
                goal: goals[i % goals.length],
                experienceLevel: 'beginner',
                isPredefined: true,
                monthlyCost: 50 + (i * 10)
            }
        });
    }

    console.log('Supplements Seeder completado.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
