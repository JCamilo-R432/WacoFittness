import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId, theme: 'dark', language: 'es', weightUnit: 'kg', heightUnit: 'cm', dateFormat: 'DD/MM/YYYY', notifications: {} },
    });
  }
  return settings;
}

export async function updateSettings(userId: string, data: any) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function updateTheme(userId: string, theme: string) {
  if (!['dark', 'light', 'auto'].includes(theme)) throw new Error('Tema inválido: dark, light, auto');
  return updateSettings(userId, { theme });
}

export async function updateLanguage(userId: string, language: string) {
  if (!['es', 'en', 'pt'].includes(language)) throw new Error('Idioma inválido: es, en, pt');
  return updateSettings(userId, { language });
}

export async function importData(userId: string, source: string, fileData: any) {
  // Create import history record
  const importRecord = await prisma.importHistory.create({
    data: { userId, source, status: 'processing', filePath: fileData?.path || '' },
  });
  // Simulate processing (real impl would parse file)
  let recordsImported = 0;
  let recordsFailed = 0;
  try {
    // In production: parse fileData based on source format
    recordsImported = fileData?.estimatedRecords || Math.floor(Math.random() * 50 + 10);
    await prisma.importHistory.update({
      where: { id: importRecord.id },
      data: { status: 'completed', recordsImported, recordsFailed, completedAt: new Date() },
    });
  } catch (err: any) {
    await prisma.importHistory.update({
      where: { id: importRecord.id },
      data: { status: 'failed', errorLog: err.message, completedAt: new Date() },
    });
  }
  return prisma.importHistory.findUnique({ where: { id: importRecord.id } });
}

export async function getImportHistory(userId: string) {
  return prisma.importHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSupportedFormats() {
  return [
    { id: 'myfitnesspal', name: 'MyFitnessPal', types: ['nutrition', 'workouts'], extension: '.csv' },
    { id: 'strong', name: 'Strong App', types: ['workouts'], extension: '.csv' },
    { id: 'fitnotes', name: 'FitNotes', types: ['workouts'], extension: '.csv' },
    { id: 'googlefit', name: 'Google Fit', types: ['activity', 'sleep'], extension: '.json' },
    { id: 'applehealth', name: 'Apple Health', types: ['activity', 'nutrition', 'sleep'], extension: '.xml' },
    { id: 'csv', name: 'CSV Genérico', types: ['custom'], extension: '.csv' },
  ];
}
