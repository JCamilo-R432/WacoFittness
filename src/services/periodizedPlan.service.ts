import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function generatePhases(type: string, durationWeeks: number) {
  const phases: any[] = [];
  if (type === 'hypertrophy') {
    phases.push({ name: 'Adaptación Anatómica', type: 'adaptation', weekStart: 1, weekEnd: Math.min(3, durationWeeks), volume: 'low', intensity: 'low', focus: 'Acostumbrar el cuerpo al volumen de entrenamiento' });
    if (durationWeeks > 3) phases.push({ name: 'Hipertrofia Base', type: 'hypertrophy', weekStart: 4, weekEnd: Math.min(10, durationWeeks), volume: 'high', intensity: 'medium', focus: 'Maximizar crecimiento muscular con alto volumen' });
    if (durationWeeks > 10) phases.push({ name: 'Deload', type: 'deload', weekStart: 11, weekEnd: Math.min(12, durationWeeks), volume: 'low', intensity: 'low', focus: 'Recuperación activa y supercompensación' });
  } else if (type === 'strength') {
    phases.push({ name: 'Adaptación', type: 'adaptation', weekStart: 1, weekEnd: Math.min(2, durationWeeks), volume: 'medium', intensity: 'low', focus: 'Técnica y preparación neurológica' });
    if (durationWeeks > 2) phases.push({ name: 'Fuerza Base', type: 'strength', weekStart: 3, weekEnd: Math.min(8, durationWeeks), volume: 'medium', intensity: 'high', focus: 'Progresión lineal de cargas pesadas' });
    if (durationWeeks > 8) phases.push({ name: 'Peaking', type: 'power', weekStart: 9, weekEnd: Math.min(11, durationWeeks), volume: 'low', intensity: 'very_high', focus: 'Maximizar fuerza para competencia o test' });
    if (durationWeeks > 11) phases.push({ name: 'Deload', type: 'deload', weekStart: 12, weekEnd: durationWeeks, volume: 'low', intensity: 'low', focus: 'Recuperación total' });
  } else {
    phases.push({ name: 'Base', type: 'adaptation', weekStart: 1, weekEnd: Math.ceil(durationWeeks * 0.3), volume: 'low', intensity: 'low', focus: 'Construcción de base aeróbica/anaeróbica' });
    phases.push({ name: 'Desarrollo', type: 'hypertrophy', weekStart: Math.ceil(durationWeeks * 0.3) + 1, weekEnd: Math.ceil(durationWeeks * 0.8), volume: 'high', intensity: 'medium', focus: 'Desarrollo de capacidades específicas' });
    phases.push({ name: 'Pico', type: 'power', weekStart: Math.ceil(durationWeeks * 0.8) + 1, weekEnd: durationWeeks, volume: 'low', intensity: 'high', focus: 'Rendimiento máximo' });
  }
  return phases;
}

function generateCycles(durationWeeks: number) {
  const cycles: any[] = [];
  for (let w = 1; w <= durationWeeks; w++) {
    const isDeload = w % 6 === 0;
    cycles.push({
      weekNumber: w,
      name: isDeload ? `Semana ${w} - Deload` : `Semana ${w}`,
      workouts: [],
      completed: false,
    });
  }
  return cycles;
}

export async function createPeriodizedPlan(userId: string, data: any) {
  const phases = generatePhases(data.type, data.durationWeeks);
  const cycles = generateCycles(data.durationWeeks);
  const plan = await prisma.periodizedPlan.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      durationWeeks: data.durationWeeks,
      difficulty: data.difficulty || 'intermediate',
      goal: data.goal || data.type,
      startDate: data.startDate ? new Date(data.startDate) : null,
      phases: { create: phases },
      cycles: { create: cycles },
    },
    include: { phases: true, cycles: true },
  });
  return plan;
}

export async function listPlans(userId: string) {
  return prisma.periodizedPlan.findMany({
    where: { userId },
    include: { phases: true, cycles: { orderBy: { weekNumber: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPlanById(userId: string, planId: string) {
  const plan = await prisma.periodizedPlan.findFirst({
    where: { id: planId, userId },
    include: { phases: true, cycles: { orderBy: { weekNumber: 'asc' } } },
  });
  if (!plan) throw new Error('Plan no encontrado');
  return plan;
}

export async function updatePlan(userId: string, planId: string, data: any) {
  const plan = await prisma.periodizedPlan.findFirst({ where: { id: planId, userId } });
  if (!plan) throw new Error('Plan no encontrado');
  return prisma.periodizedPlan.update({
    where: { id: planId },
    data: {
      name: data.name ?? plan.name,
      type: data.type ?? plan.type,
      goal: data.goal ?? plan.goal,
      startDate: data.startDate ? new Date(data.startDate) : plan.startDate,
      completed: data.completed ?? plan.completed,
      completedAt: data.completed ? new Date() : plan.completedAt,
    },
    include: { phases: true, cycles: true },
  });
}

export async function deletePlan(userId: string, planId: string) {
  const plan = await prisma.periodizedPlan.findFirst({ where: { id: planId, userId } });
  if (!plan) throw new Error('Plan no encontrado');
  await prisma.periodizedPlan.delete({ where: { id: planId } });
  return { success: true };
}

export async function getPlanProgress(userId: string, planId: string) {
  const plan = await prisma.periodizedPlan.findFirst({
    where: { id: planId, userId },
    include: { cycles: true, phases: true },
  });
  if (!plan) throw new Error('Plan no encontrado');
  const totalCycles = plan.cycles.length;
  const completedCycles = plan.cycles.filter(c => c.completed).length;
  const progressPct = totalCycles > 0 ? Math.round((completedCycles / totalCycles) * 100) : 0;
  const currentPhase = plan.phases.find(p => {
    const currentWeek = completedCycles + 1;
    return currentWeek >= p.weekStart && currentWeek <= p.weekEnd;
  });
  return { plan, progressPct, completedCycles, totalCycles, currentPhase };
}
