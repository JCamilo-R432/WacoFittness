import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREDEFINED = [
    { name: 'Starting Strength', splitType: 'fullbody', goal: 'strength', duration: 12 },
    { name: 'StrongLifts 5x5', splitType: 'fullbody', goal: 'strength', duration: 12 },
    { name: 'PHUL', splitType: 'upperLower', goal: 'hypertrophy', duration: 8 },
    { name: 'PHAT', splitType: 'broSplit', goal: 'hypertrophy', duration: 12 },
    { name: 'Push/Pull/Legs', splitType: 'pushPullLegs', goal: 'hypertrophy', duration: 8 },
    { name: 'Upper/Lower', splitType: 'upperLower', goal: 'strength', duration: 8 },
    { name: '5/3/1', splitType: 'fullbody', goal: 'strength', duration: 16 },
    { name: 'Texas Method', splitType: 'fullbody', goal: 'strength', duration: 8 },
    { name: 'Bro Split', splitType: 'broSplit', goal: 'hypertrophy', duration: 8 },
    { name: 'Fullbody Hipertrofia', splitType: 'fullbody', goal: 'hypertrophy', duration: 8 }
];

async function main() {
    console.log('Inserting 10 predefined plans...');
    // Dummy user for predefined plans:
    let admin = await prisma.user.findFirst();
    if (!admin) {
        admin = await prisma.user.create({
            data: { email: 'admin@gym.com', password: 'hash', name: 'Admin' }
        });
    }

    for (const p of PREDEFINED) {
        await prisma.trainingPlan.create({
            data: {
                userId: admin.id,
                name: p.name,
                splitType: p.splitType,
                goal: p.goal,
                durationWeeks: p.duration,
                daysPerWeek: 3,
                experienceLevel: 'beginner',
                isPredefined: true
            }
        });
    }

    console.log('Seeder finished.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
