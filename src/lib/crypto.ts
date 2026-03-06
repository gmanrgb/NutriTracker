import { hash, verify } from '@node-rs/argon2';
import { createHash, randomBytes } from 'crypto';

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  try {
    return await verify(storedHash, plain);
  } catch {
    return false;
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
