import { Request, Response, NextFunction } from 'express';
import { verifyPlayerToken } from '../utils/authUtils.js';

export interface PlayerRequest extends Request {
  player?: {
    id: string;
    playerName: string;
    email: string;
  };
}

export const playerAuth = (req: PlayerRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to start a competition match.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyPlayerToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired player session. Please log in again.'
    });
  }

  req.player = decoded;
  next();
};

export const optionalPlayerAuth = (req: PlayerRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyPlayerToken(token);
    if (decoded) {
      req.player = decoded;
    }
  }
  next();
};
