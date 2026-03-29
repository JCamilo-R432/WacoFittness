import prisma from '../config/database';

export class TrainingService {
  static async getExercises(params: any) {
    const { category, difficulty, equipment, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (equipment) {
      where.equipment = { has: equipment };
    }

    const [items, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.exercise.count({ where })
    ]);

    return { items, total, pages: Math.ceil(total / limit) };
  }

  static async getExerciseById(id: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        workoutExercises: { take: 5, orderBy: { workoutLog: { workoutDate: 'desc' } } },
        personalRecords: { where: { isCurrent: true } }
      }
    });
    if (!exercise) throw new Error('Ejercicio no encontrado');
    return exercise;
  }

  static async logWorkout(userId: string, data: any) {
    const { trainingDayId, workoutDate, startTime, endTime, notes, exercises } = data;

    return await prisma.$transaction(async (tx) => {
      const workoutLog = await tx.workoutLog.create({
        data: {
          userId,
          trainingDayId,
          workoutDate: new Date(workoutDate),
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          notes,
          isCompleted: true,
        }
      });

      for (const [index, ex] of exercises.entries()) {
        await tx.workoutExercise.create({
          data: {
            workoutLogId: workoutLog.id,
            exerciseId: ex.exerciseId,
            order: index + 1,
            sets: ex.sets,
            repsCompleted: ex.repsCompleted,
            weightKg: ex.weightKg,
            rpe: ex.rpe,
            notes: ex.notes
          }
        });

        // Actualizar Récord Personal si aplica
        const repsArray = ex.repsCompleted.split(',').map((r: string) => parseInt(r.trim()));
        const maxReps = Math.max(...repsArray);

        const currentPR = await tx.personalRecord.findFirst({
          where: { userId, exerciseId: ex.exerciseId, isCurrent: true }
        });

        if (!currentPR || ex.weightKg > Number(currentPR.weightKg) || (ex.weightKg === Number(currentPR.weightKg) && maxReps > currentPR.reps)) {
          if (currentPR) {
            await tx.personalRecord.update({
              where: { id: currentPR.id },
              data: { isCurrent: false }
            });
          }
          await tx.personalRecord.create({
            data: {
              userId,
              exerciseId: ex.exerciseId,
              weightKg: ex.weightKg,
              reps: maxReps,
              date: new Date(workoutDate),
              workoutLogId: workoutLog.id,
              isCurrent: true
            }
          });
        }
      }

      return workoutLog;
    });
  }

  static async getWorkouts(userId: string) {
    return await prisma.workoutLog.findMany({
      where: { userId },
      include: {
        exercises: { include: { exercise: true } }
      },
      orderBy: { workoutDate: 'desc' }
    });
  }
}
