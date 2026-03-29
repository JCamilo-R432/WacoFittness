import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = 'test@wacopro.com';
const PASSWORD = 'password123';
const NAME = 'WacoPro Test';

async function main() {
  console.log('🔧 Creando/actualizando usuario de prueba...\n');

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });

  if (existing) {
    await prisma.user.update({
      where: { email: EMAIL },
      data: { password: hashedPassword },
    });
    console.log('✅ Usuario actualizado con nueva contraseña.');
  } else {
    await prisma.user.create({
      data: { email: EMAIL, password: hashedPassword, name: NAME },
    });
    console.log('✅ Usuario creado exitosamente.');
  }

  console.log('\n📝 Credenciales listas:');
  console.log('   Email:    ', EMAIL);
  console.log('   Password: ', PASSWORD);
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
