import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { getToken } from 'next-auth/jwt';
import User from '../model/User.model';
import mongoose from 'mongoose';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken =
      req.cookies?.['next-auth.session-token'] ||
      req.cookies?.['__Secure-next-auth.session-token'];

    if (!sessionToken) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
      return;
    }

    const nextAuthToken = await getToken({ req, secret: env.NEXTAUTH_SECRET });

    if (!nextAuthToken || !nextAuthToken.id) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
      return;
    }

    const user = await User.findById(nextAuthToken.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};
