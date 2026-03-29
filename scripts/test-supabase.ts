import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('\n=== 🛰️ PROBANDO CONEXIÓN A SUPABASE (WACOPRO-FITNESS) ===\n')

  try {
    // 1. Probar Prisma
    console.log('🔌 1. Conectando con Prisma...')
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos en la nube.')

    // 2. Verificar tablas y conteos
    console.log('\n📊 2. Estado actual de las tablas:')
    const stats = {
      Usuarios: await prisma.user.count(),
      Alimentos: await prisma.foodItem.count(),
      Ejercicios: await prisma.exercise.count(),
      Suplementos: await prisma.supplement.count(),
      Recetas: await prisma.recipe.count(),
      Plantillas_Notif: await prisma.notificationTemplate.count()
    }

    console.table(stats)

    // 3. Probar query con relaciones
    console.log('\n🔗 3. Verificando integridad de relaciones...')
    const tempEmail = `test_${Date.now()}@supabase.com`
    const testUser = await prisma.user.create({
      data: {
        email: tempEmail,
        password: 'test_password_secure',
        name: 'WacoPro Test User'
      }
    })
    console.log(`✅ Usuario de prueba creado: ${testUser.id}`)

    // 4. Limpiar
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log('✅ Usuario de prueba eliminado (Cleanup OK)')

    console.log('\n🏆 TODAS LAS PRUEBAS DE INFRAESTRUCTURA FUERON EXITOSAS\n')

  } catch (error) {
    console.error('❌ Error en las pruebas de conexión:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
