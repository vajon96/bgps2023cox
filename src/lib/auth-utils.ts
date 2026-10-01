import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Generate cryptographically secure temporary password (e.g. BG23@7Kp92)
export function generateSecureTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const prefix = 'BG23@';
  let randomPart = '';
  const bytes = crypto.randomBytes(5);
  for (let i = 0; i < 5; i++) {
    randomPart += chars[bytes[i] % chars.length];
  }
  return `${prefix}${randomPart}`;
}

// Generate unique username based on full name
export async function generateUniqueUsername(fullName: string): Promise<string> {
  // Clean full name: remove special chars, convert to lowercase without spaces
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 18);

  const fallbackBase = base || 'classmate';

  // Candidate patterns: base, base23, base2301, base2302... base001...
  const candidates: string[] = [
    fallbackBase,
    `${fallbackBase}23`,
    `${fallbackBase}2301`,
    `${fallbackBase}2302`,
    `${fallbackBase}001`,
    `${fallbackBase}002`,
  ];

  for (const candidate of candidates) {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, candidate)).limit(1);
    if (existing.length === 0) {
      return candidate;
    }
  }

  // If still colliding, append random digits
  for (let attempt = 1; attempt <= 50; attempt++) {
    const candidate = `${fallbackBase}${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, candidate)).limit(1);
    if (existing.length === 0) {
      return candidate;
    }
  }

  return `${fallbackBase}${Date.now().toString().slice(-4)}`;
}
