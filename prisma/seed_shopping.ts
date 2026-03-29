import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inserting predefined shopping ingredients and stores...');

    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: { email: 'user@shop.com', password: 'hash', name: 'Tester User' }
        });
    }

    // Tiendas
    const stores = ['Supermercado Lider', 'Mercadona', 'Jumbo', 'Tienda Suplementos', 'Mercado Local'];
    for (const store of stores) {
        await prisma.store.create({
            data: { userId: user.id, name: store, category: 'supermercado' }
        });
    }

    // Inyectar FoodItems base si no hay
    const itemsBase = [
        { name: 'Pechuga de Pollo', cat: 'proteins', unit: 'kg' },
        { name: 'Arroz Blanco', cat: 'grains', unit: 'kg' },
        { name: 'Huevos', cat: 'proteins', unit: 'units' },
        { name: 'Leche Desnatada', cat: 'dairy', unit: 'L' },
        { name: 'Plátano', cat: 'fruits', unit: 'units' },
        { name: 'Avena', cat: 'grains', unit: 'kg' }
    ];

    /* 
      Se generarían los items base para completar los 50. 
      Lógica es omitida para simplificar. 
    */

    for (let i = 0; i < 50; i++) {
        const isPantry = i % 5 === 0;
        await prisma.foodItem.create({
            data: {
                userId: user.id,
                name: `${itemsBase[i % itemsBase.length].name} Var${i}`,
                category: itemsBase[i % itemsBase.length].cat,
                caloriesPer100g: 100 + i,
                proteinPer100g: 10 + i,
                carbsPer100g: 20 + i,
                fatPer100g: 5 + i,
                servingSizeG: 100,
                servingUnit: 'g'
            }
        });
    }

    console.log('Seeder Shopping completado.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
