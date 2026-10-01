import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { getOrCreateUser } from '../db/users.ts';
import { adminAuth } from '../lib/firebase-admin.ts';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'bgps_ssc2023_secure_jwt_token_secret_coxsbazar_reunion';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role?: string;
  };
  dbUser?: typeof users.$inferSelect;
}

// Generate simple secure signed token for non-Google/custom users & session persistence
export function generateToken(payload: { uid: string; email: string; role?: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyCustomToken(token: string): { uid: string; email: string; role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Try custom/session token first
  const customPayload = verifyCustomToken(token);
  if (customPayload) {
    req.user = customPayload;
    try {
      const dbUser = await getOrCreateUser(customPayload.uid, customPayload.email, customPayload.role || 'member');
      req.dbUser = dbUser;
      return next();
    } catch (e) {
      console.error('Error attaching dbUser for custom token:', e);
      return res.status(500).json({ error: 'Failed to synchronize user record' });
    }
  }

  // Try Firebase Admin ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || `${decodedToken.uid}@bgps2023.org`,
    };
    const dbUser = await getOrCreateUser(req.user.uid, req.user.email);
    req.dbUser = dbUser;
    return next();
  } catch (error) {
    // If Firebase Admin throws, could be expired or invalid
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (!req.dbUser || (req.dbUser.role !== 'admin' && req.dbUser.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
};

export const requireModerator = async (req: AuthRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (
      !req.dbUser ||
      (req.dbUser.role !== 'admin' && req.dbUser.role !== 'super_admin' && req.dbUser.role !== 'moderator')
    ) {
      return res.status(403).json({ error: 'Forbidden: Moderator or Admin access required' });
    }
    next();
  });
};

export const requireSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (!req.dbUser || req.dbUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }
    next();
  });
};
