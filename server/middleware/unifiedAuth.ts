import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { isAuthenticated as replitIsAuthenticated } from '../replitAuth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    authType: 'replit' | 'jwt';
    claims?: any; // For Replit auth
  };
}

// Unified authentication middleware that supports both JWT and Replit OAuth
export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  // First try JWT authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (!err && decoded) {
        try {
          const user = await storage.getUser(decoded.userId);
          if (user && user.authType === 'jwt') {
            req.user = {
              id: user.id,
              email: user.email!,
              firstName: user.firstName!,
              lastName: user.lastName!,
              role: user.role!,
              authType: 'jwt',
            };
            return next();
          }
        } catch (error) {
          // Fall through to Replit auth
        }
      }
      // If JWT fails, try Replit auth
      return tryReplitAuth(req, res, next);
    });
  } else {
    // No JWT token, try Replit auth
    return tryReplitAuth(req, res, next);
  }
}

function tryReplitAuth(req: AuthRequest, res: Response, next: NextFunction) {
  replitIsAuthenticated(req, res, async (err?: any) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // If Replit auth succeeded, transform the user data
    const replitUser = req.user as any;
    if (replitUser && replitUser.claims) {
      try {
        const user = await storage.getUser(replitUser.claims.sub);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email!,
            firstName: user.firstName!,
            lastName: user.lastName!,
            role: user.role!,
            authType: 'replit',
            claims: replitUser.claims,
          };
          return next();
        }
      } catch (error) {
        console.error('Error fetching user for Replit auth:', error);
      }
    }

    return res.status(401).json({ message: 'Unauthorized' });
  });
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

// Optional middleware to require specific roles
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}