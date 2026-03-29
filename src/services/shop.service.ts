import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DEMO_PRODUCTS = [
  { name: 'Whey Protein Gold Standard', brand: 'Optimum Nutrition', category: 'protein', description: 'Proteína de suero de alta calidad con 24g por porción', price: 59.99, rating: 4.8, reviewCount: 2341, affiliateUrl: '#', tags: ['proteína', 'whey', 'masa muscular'], macros: { protein: 24, carbs: 3, fat: 1, calories: 120 } },
  { name: 'Creatina Monohidrato', brand: 'MyProtein', category: 'creatine', description: 'Creatina monohidrato micronizada para fuerza y potencia', price: 19.99, rating: 4.7, reviewCount: 1876, affiliateUrl: '#', tags: ['creatina', 'fuerza', 'potencia'], macros: { protein: 0, carbs: 0, fat: 0, calories: 0 } },
  { name: 'Pre-Workout C4 Original', brand: 'Cellucor', category: 'preworkout', description: 'Pre-entreno explosivo con cafeína, beta-alanina y citrulina', price: 34.99, rating: 4.6, reviewCount: 3120, affiliateUrl: '#', tags: ['pre-entreno', 'energía', 'rendimiento'], macros: { protein: 0, carbs: 5, fat: 0, calories: 25 } },
  { name: 'BCAA 2:1:1', brand: 'Scivation Xtend', category: 'aminoacids', description: 'Aminoácidos de cadena ramificada para recuperación y síntesis proteica', price: 29.99, rating: 4.5, reviewCount: 987, affiliateUrl: '#', tags: ['bcaa', 'recuperación', 'aminoácidos'], macros: { protein: 7, carbs: 0, fat: 0, calories: 30 } },
  { name: 'Omega-3 Fish Oil', brand: 'Nordic Naturals', category: 'vitamins', description: 'Aceite de pescado purificado, 1000mg EPA+DHA por cápsula', price: 24.99, rating: 4.9, reviewCount: 1543, affiliateUrl: '#', tags: ['omega-3', 'salud', 'inflamación'], macros: null },
  { name: 'Vitamina D3 + K2', brand: 'NOW Foods', category: 'vitamins', description: 'Combinación óptima de vitamina D3 y K2 para huesos y sistema inmune', price: 18.99, rating: 4.7, reviewCount: 876, affiliateUrl: '#', tags: ['vitamina d', 'huesos', 'inmunidad'], macros: null },
  { name: 'Mass Gainer', brand: 'BSN True Mass', category: 'gainer', description: 'Ganador de masa con 700 calorías y 50g de proteína por porción', price: 64.99, rating: 4.4, reviewCount: 654, affiliateUrl: '#', tags: ['ganador', 'masa', 'calorías'], macros: { protein: 50, carbs: 90, fat: 17, calories: 700 } },
  { name: 'L-Carnitina', brand: 'Dymatize', category: 'fatburner', description: 'L-Carnitina líquida para uso de grasa como energía', price: 22.99, rating: 4.3, reviewCount: 432, affiliateUrl: '#', tags: ['carnitina', 'grasa', 'quemador'], macros: { protein: 0, carbs: 1, fat: 0, calories: 5 } },
];

export async function getProducts(filters: any = {}) {
  // Seed demo products if DB is empty
  const count = await prisma.shopProduct.count();
  if (count === 0) {
    await prisma.shopProduct.createMany({ data: DEMO_PRODUCTS.map(p => ({ ...p, macros: p.macros as any, isActive: true })) });
  }
  const where: any = { isActive: true };
  if (filters.category) where.category = filters.category;
  if (filters.search) where.name = { contains: filters.search, mode: 'insensitive' };
  return prisma.shopProduct.findMany({ where, orderBy: { rating: 'desc' } });
}

export async function getRecommendations(goal: string) {
  const categoryMap: Record<string, string[]> = {
    'muscle_gain': ['protein', 'creatine', 'gainer', 'aminoacids'],
    'fat_loss': ['fatburner', 'protein', 'vitamins'],
    'performance': ['preworkout', 'creatine', 'aminoacids'],
    'recovery': ['protein', 'aminoacids', 'vitamins'],
    'health': ['vitamins', 'omega3'],
  };
  const categories = categoryMap[goal] || ['protein', 'creatine', 'vitamins'];
  const count = await prisma.shopProduct.count();
  if (count === 0) await getProducts();
  return prisma.shopProduct.findMany({
    where: { isActive: true, category: { in: categories } },
    orderBy: { rating: 'desc' },
    take: 6,
  });
}
