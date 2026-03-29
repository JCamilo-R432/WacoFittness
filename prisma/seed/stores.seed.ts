import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedStores() {
  console.log('🏪 Sembrando tiendas profesionales...')

  // Como Store requiere un userId en el schema original, buscaremos un admin o crearemos uno genérico
  let admin = await prisma.user.findFirst({ where: { email: 'admin@wacopro.com' } })

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@wacopro.com',
        password: 'password_seguro_123',
        name: 'Administrador Sistema'
      }
    })
  }

  const stores = [
    { name: 'Éxito', category: 'supermercado', isFavorite: true, userId: admin.id },
    { name: 'Carulla', category: 'supermercado', isFavorite: false, userId: admin.id },
    { name: 'GNC Live Well', category: 'tienda especializada', isFavorite: true, userId: admin.id },
    { name: 'Smart Fit Nutri', category: 'tienda especializada', isFavorite: false, userId: admin.id },
    { name: 'Mercado Local', category: 'mercado', isFavorite: false, userId: admin.id }
  ]

  for (let i = stores.length; i < 20; i++) {
    stores.push({
      name: `Tienda Fitness ${i + 1}`,
      category: i % 2 === 0 ? 'supermercado' : 'tienda especializada',
      isFavorite: false,
      userId: admin.id
    })
  }

  for (const store of stores) {
    await prisma.store.create({
      data: store
    })
  }

  console.log(`✅ ${stores.length} tiendas sembradas.`)
}
