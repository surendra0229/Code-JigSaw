import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../utils/authUtils.js';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    userId: string;
    displayName: string;
  };
}

export const adminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Admin authorization token required.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAdminToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin session token. Please log in again.'
    });
  }

  req.admin = decoded;
  next();
};
