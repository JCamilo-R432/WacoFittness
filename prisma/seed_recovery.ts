import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inserting predefined recovery data...');

    const techNames = [
        'Respiración 4-7-8', 'Box Breathing', 'Escaneo corporal 10m', 'Meditación guiada dormir',
        'Visualización de lugar seguro', 'Yoga Nidra 20m', 'Relajación muscular progresiva', 'Mindfulness 5m',
        'Respiración diafragmática', 'Resonancia HRV'
    ]; // Array of 10 base strings

    for (let i = 0; i < 50; i++) {
        await prisma.relaxationTechnique.create({
            data: {
                name: `${techNames[i % 10]} v${i}`,
                category: i % 2 === 0 ? 'breathing' : 'meditation',
                durationMinutes: 5 + (i % 20),
                difficulty: i % 3 === 0 ? 'advanced' : 'beginner',
                benefits: ['Reducción de estrés', 'Calma'],
                bestFor: ['postWorkout', 'preSleep'],
                isVerified: true
            }
        });
    }

    const routines = ['Estiramientos pre-entreno', 'Post-entreno', 'Antes de dormir', 'Movilidad cadera', 'Espalda alta'];
    for (let i = 0; i < 20; i++) {
        await prisma.stretchingRoutine.create({
            data: {
                name: `${routines[i % 5]} Nivel ${i}`,
                category: 'fullBody',
                durationMinutes: 10,
                difficulty: 'beginner',
                stretches: [{ name: "Hamstring", duration: 30, side: "both" }],
                benefits: ['Flexibilidad']
            }
        });
    }

    const tools = ['Foam Roller', 'Masaje deportivo', 'Crioterapia', 'Baño de hielo', 'Sauna', 'Botas de compresión', 'Elevación de piernas', 'Sales de Epsom', 'Pistola de masaje', 'Bandas de resistencia'];
    for (const t of tools) {
        await prisma.recoveryTool.create({
            data: {
                name: t,
                recommendedFrequency: 'daily',
                bestFor: ['muscleSoreness']
            }
        });
    }

    console.log('Seeder Recovery completado (50 Técnicas, 20 Stretching, 10 Tools).');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
