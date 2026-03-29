/**
 * WacoPro Fitness — Verificación de migración de base de datos
 * Uso: npx ts-node scripts/verify-migration.ts
 */

import prisma from '../src/config/database';

interface TableCheck {
  name: string;
  mapName: string;
  required: boolean;
  phase: number;
}

const TABLES_TO_CHECK: TableCheck[] = [
  // Fase 1 — tablas base
  { name: 'User',                  mapName: 'users',                  required: true,  phase: 1 },
  { name: 'NutritionProfile',      mapName: 'nutrition_profiles',     required: true,  phase: 1 },
  { name: 'TrainingProfile',       mapName: 'training_profiles',      required: true,  phase: 1 },
  { name: 'WorkoutLog',            mapName: 'workout_logs',           required: true,  phase: 1 },
  { name: 'MealLog',               mapName: 'meal_logs',              required: true,  phase: 1 },
  { name: 'HydrationLog',          mapName: 'hydration_logs',         required: true,  phase: 1 },
  { name: 'SleepLog',              mapName: 'sleep_logs',             required: true,  phase: 1 },
  { name: 'UserSupplement',        mapName: 'user_supplements',       required: true,  phase: 1 },
  { name: 'ShoppingList',          mapName: 'shopping_lists',         required: true,  phase: 1 },
  { name: 'Notification',          mapName: 'notifications',          required: true,  phase: 1 },
  { name: 'Achievement',           mapName: 'achievements',           required: true,  phase: 1 },

  // Fase 2 — tablas nuevas
  { name: 'SocialPost',            mapName: 'social_posts',           required: true,  phase: 2 },
  { name: 'PostLike',              mapName: 'post_likes',             required: true,  phase: 2 },
  { name: 'PostComment',           mapName: 'post_comments',          required: true,  phase: 2 },
  { name: 'UserFollow',            mapName: 'user_follows',           required: true,  phase: 2 },
  { name: 'BodyMeasurement',       mapName: 'body_measurements',      required: true,  phase: 2 },
];

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ) as exists
    `;
    return result[0]?.exists ?? false;
  } catch {
    return false;
  }
}

async function verifyMigration() {
  console.log('\n============================================================');
  console.log('  WACOPRO FITNESS — VERIFICACIÓN DE MIGRACIÓN');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;
  const missingPhase2: string[] = [];

  // Group by phase
  const phase1 = TABLES_TO_CHECK.filter(t => t.phase === 1);
  const phase2 = TABLES_TO_CHECK.filter(t => t.phase === 2);

  console.log('── FASE 1 (tablas base) ────────────────────────────────────');
  for (const table of phase1) {
    const exists = await checkTableExists(table.mapName);
    const icon = exists ? '✅' : '❌';
    console.log(`  ${icon} ${table.name.padEnd(28)} → ${table.mapName}`);
    exists ? passed++ : failed++;
  }

  console.log('\n── FASE 2 (tablas nuevas) ──────────────────────────────────');
  for (const table of phase2) {
    const exists = await checkTableExists(table.mapName);
    const icon = exists ? '✅' : '❌';
    console.log(`  ${icon} ${table.name.padEnd(28)} → ${table.mapName}`);
    if (exists) {
      passed++;
    } else {
      failed++;
      missingPhase2.push(table.name);
    }
  }

  // Count of all tables in DB
  const allTables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;

  console.log(`\n── RESUMEN ─────────────────────────────────────────────────`);
  console.log(`  Total tablas en BD:    ${allTables.length}`);
  console.log(`  Verificadas OK:        ${passed}`);
  console.log(`  Faltantes/Error:       ${failed}`);

  if (failed === 0) {
    console.log('\n  ✅ TODAS LAS TABLAS VERIFICADAS CORRECTAMENTE');
    console.log('  La app está lista para iniciar con: npm run dev');
  } else {
    console.log('\n  ❌ FALTAN TABLAS — Ejecuta la migración:');
    console.log('     scripts\\migrate.bat  (opción 1 recomendada)');
    if (missingPhase2.length > 0) {
      console.log(`\n  Tablas de Fase 2 faltantes:`);
      missingPhase2.forEach(t => console.log(`     - ${t}`));
    }
  }

  console.log('\n  Todas las tablas en la base de datos:');
  allTables.forEach(t => console.log(`     · ${t.tablename}`));
  console.log('\n============================================================\n');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

verifyMigration().catch(async (e) => {
  console.error('\n  ❌ Error al conectar con la base de datos:', e.message);
  console.error('\n  Posibles causas:');
  console.error('  1. DIRECT_URL o DATABASE_URL incorrecta en .env');
  console.error('  2. Supabase pausado — ve a supabase.com y despausa tu proyecto');
  console.error('  3. Sin conexión a internet');
  await prisma.$disconnect();
  process.exit(1);
});
