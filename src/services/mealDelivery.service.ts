import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DEMO_RESTAURANTS = [
  { id: 'r1', name: 'FitFood Express', rating: 4.7, deliveryTime: '25-35 min', priceRange: '$$', macroFocus: ['high_protein', 'balanced'], cuisine: 'Saludable', imageUrl: null },
  { id: 'r2', name: 'Keto Kitchen', rating: 4.5, deliveryTime: '30-45 min', priceRange: '$$$', macroFocus: ['keto', 'low_carb'], cuisine: 'Keto', imageUrl: null },
  { id: 'r3', name: 'Green Bowl', rating: 4.6, deliveryTime: '20-30 min', priceRange: '$$', macroFocus: ['vegan', 'balanced'], cuisine: 'Vegano', imageUrl: null },
  { id: 'r4', name: 'Pollo Power', rating: 4.4, deliveryTime: '20-30 min', priceRange: '$', macroFocus: ['high_protein'], cuisine: 'Proteico', imageUrl: null },
  { id: 'r5', name: 'Mediterranean Grill', rating: 4.8, deliveryTime: '35-50 min', priceRange: '$$$', macroFocus: ['balanced', 'mediterranean'], cuisine: 'Mediterránea', imageUrl: null },
];

const DEMO_MEALS: Record<string, any[]> = {
  'r1': [
    { name: 'Bowl de Pollo y Quinoa', calories: 480, proteinG: 42, carbsG: 45, fatG: 12, price: 12.99, tags: ['high_protein', 'balanced'] },
    { name: 'Salmón con Batata', calories: 520, proteinG: 38, carbsG: 40, fatG: 18, price: 14.99, tags: ['high_protein', 'omega3'] },
    { name: 'Pechuga Grillada + Arroz', calories: 420, proteinG: 45, carbsG: 38, fatG: 8, price: 11.99, tags: ['high_protein', 'low_fat'] },
  ],
  'r2': [
    { name: 'Burger Keto', calories: 580, proteinG: 45, carbsG: 5, fatG: 42, price: 13.99, tags: ['keto', 'low_carb'] },
    { name: 'Ensalada Caesar Keto', calories: 380, proteinG: 28, carbsG: 6, fatG: 28, price: 10.99, tags: ['keto'] },
  ],
  'r3': [
    { name: 'Buddha Bowl Vegano', calories: 440, proteinG: 18, carbsG: 62, fatG: 14, price: 11.99, tags: ['vegan', 'balanced'] },
    { name: 'Tofu Stir-fry', calories: 360, proteinG: 22, carbsG: 38, fatG: 12, price: 10.99, tags: ['vegan', 'high_protein'] },
  ],
  'r4': [
    { name: 'Pollo Asado 200g + Arroz', calories: 460, proteinG: 50, carbsG: 42, fatG: 8, price: 9.99, tags: ['high_protein'] },
    { name: 'Combo Proteico', calories: 620, proteinG: 60, carbsG: 48, fatG: 15, price: 12.99, tags: ['high_protein', 'bulk'] },
  ],
  'r5': [
    { name: 'Pollo al Limón con Cuscús', calories: 490, proteinG: 38, carbsG: 52, fatG: 14, price: 13.99, tags: ['balanced', 'mediterranean'] },
    { name: 'Kebab de Pavo', calories: 420, proteinG: 40, carbsG: 35, fatG: 12, price: 12.49, tags: ['high_protein', 'mediterranean'] },
  ],
};

export async function getRestaurants(filters: any = {}) {
  let restaurants = DEMO_RESTAURANTS;
  if (filters.macroFocus) {
    restaurants = restaurants.filter(r => r.macroFocus.includes(filters.macroFocus));
  }
  return restaurants;
}

export async function getMeals(restaurantId: string) {
  return DEMO_MEALS[restaurantId] || [];
}

export async function createOrder(userId: string, data: any) {
  const items = data.items || [];
  const totals = items.reduce((acc: any, item: any) => ({
    calories: acc.calories + (item.calories || 0) * item.quantity,
    proteinG: acc.proteinG + (item.proteinG || 0) * item.quantity,
    carbsG: acc.carbsG + (item.carbsG || 0) * item.quantity,
    fatG: acc.fatG + (item.fatG || 0) * item.quantity,
    price: acc.price + (item.price || 0) * item.quantity,
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, price: 0 });
  return prisma.mealDeliveryOrder.create({
    data: {
      userId,
      restaurantName: data.restaurantName,
      restaurantId: data.restaurantId,
      provider: data.provider || 'manual',
      totalCalories: totals.calories,
      totalProteinG: totals.proteinG,
      totalCarbsG: totals.carbsG,
      totalFatG: totals.fatG,
      totalPrice: totals.price,
      notes: data.notes,
      items: { create: items.map((item: any) => ({ name: item.name, quantity: item.quantity || 1, calories: item.calories, proteinG: item.proteinG, carbsG: item.carbsG, fatG: item.fatG, price: item.price })) },
    },
    include: { items: true },
  });
}

export async function getOrders(userId: string) {
  return prisma.mealDeliveryOrder.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { orderedAt: 'desc' },
  });
}
