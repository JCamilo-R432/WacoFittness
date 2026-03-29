import { Request, Response } from 'express';
import * as svc from '../services/program.service';

const ok = (res: Response, data: any) => res.json({ success: true, ...data });
const err = (res: Response, e: any) => {
  const map: Record<string, [number, string]> = {
    PROGRAM_NOT_FOUND: [404, 'Programa no encontrado'],
    NOT_ENROLLED: [400, 'No estás inscrito en este programa'],
  };
  const [status, message] = map[e.message] ?? [500, 'Error del servidor'];
  return res.status(status).json({ success: false, error: message });
};

export const getPrograms = async (req: Request, res: Response) => {
  try {
    const result = await svc.listPrograms({
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      goal: req.query.goal as string,
      equipment: req.query.equipment as string,
      maxWeeks: req.query.maxWeeks ? Number(req.query.maxWeeks) : undefined,
      isFree: req.query.isFree === 'true' ? true : req.query.isFree === 'false' ? false : undefined,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    ok(res, result);
  } catch (e) { err(res, e); }
};

export const getProgram = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    ok(res, { program: await svc.getProgramById(req.params.id, userId) });
  } catch (e) { err(res, e); }
};

export const enroll = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { enrollment: await svc.enrollInProgram(userId, req.params.id) });
  } catch (e) { err(res, e); }
};

export const myPrograms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { enrollments: await svc.getMyPrograms(userId) });
  } catch (e) { err(res, e); }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentWeek, currentDay } = req.body;
    ok(res, { enrollment: await svc.updateProgramProgress(userId, req.params.id, currentWeek, currentDay) });
  } catch (e) { err(res, e); }
};

export const completeProgram = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { enrollment: await svc.completeProgram(userId, req.params.id) });
  } catch (e) { err(res, e); }
};
