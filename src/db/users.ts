import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, defaultRole: string = 'member') {
  try {
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }

    // Auto-promote to super_admin if this is the first user or email matches admin email
    const allUsers = await db.select().from(users).limit(2);
    const roleToAssign = allUsers.length === 0 ? 'super_admin' : defaultRole;

    const result = await db.insert(users)
      .values({
        uid,
        email: email.toLowerCase(),
        role: roleToAssign,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email.toLowerCase(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database operation failed', { cause: error });
  }
}
