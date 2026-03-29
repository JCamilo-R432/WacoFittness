import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}

export const sendSuccess = (res: Response, data: any, message = 'Operación exitosa', status = 200, pagination?: any) => {
  const response: ApiResponse = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...(pagination && { pagination })
  };
  return res.status(status).json(response);
};

export const sendError = (res: Response, error: string, code = 'INTERNAL_ERROR', status = 500) => {
  const response: ApiResponse = {
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(response);
};
