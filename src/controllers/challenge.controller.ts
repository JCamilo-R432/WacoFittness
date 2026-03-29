import { Request, Response } from 'express';
import * as svc from '../services/challenge.service';

const ok = (res: Response, data: any) => res.json({ success: true, ...data });
const err = (res: Response, e: any) => {
  const map: Record<string, [number, string]> = {
    CHALLENGE_NOT_FOUND: [404, 'Reto no encontrado'],
    CHALLENGE_ENDED: [400, 'El reto ya terminó'],
    CHALLENGE_FULL: [400, 'El reto está lleno'],
    NOT_JOINED: [400, 'No te has unido a este reto'],
  };
  const [status, message] = map[e.message] ?? [500, 'Error del servidor'];
  return res.status(status).json({ success: false, error: message });
};

export const getChallenges = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const filter = (req.query.filter as any) ?? 'active';
    ok(res, { challenges: await svc.listChallenges(filter, userId) });
  } catch (e) { err(res, e); }
};

export const getChallenge = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    ok(res, { challenge: await svc.getChallengeById(req.params.id, userId) });
  } catch (e) { err(res, e); }
};

export const join = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { participant: await svc.joinChallenge(userId, req.params.id) });
  } catch (e) { err(res, e); }
};

export const submitProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { progress } = req.body;
    if (progress === undefined || isNaN(Number(progress))) {
      return res.status(400).json({ success: false, error: 'progress es requerido' });
    }
    ok(res, { participant: await svc.submitProgress(userId, req.params.id, Number(progress)) });
  } catch (e) { err(res, e); }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    ok(res, { leaderboard: await svc.getLeaderboard(req.params.id, Number(req.query.limit) || 50) });
  } catch (e) { err(res, e); }
};

export const myChallenges = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    ok(res, { challenges: await svc.getMyChallenges(userId) });
  } catch (e) { err(res, e); }
};
