import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
if (!process.env.JWT_SECRET) { console.error('FATAL: JWT_SECRET env var not set'); }
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? '';
if (!process.env.JWT_REFRESH_SECRET) { console.error('FATAL: JWT_REFRESH_SECRET env var not set'); }

export const generateToken = (payload: { id: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const generateRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
