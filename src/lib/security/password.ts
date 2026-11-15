import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELISM, maxmem: MAX_MEMORY });
  return ['scrypt', COST, BLOCK_SIZE, PARALLELISM, salt.toString('base64url'), key.toString('base64url')].join(':');
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, cost, blockSize, parallelism, salt, expected] = stored.split(':');
  if (scheme !== 'scrypt' || !cost || !blockSize || !parallelism || !salt || !expected) return false;
  const expectedKey = Buffer.from(expected, 'base64url');
  const key = scryptSync(password, Buffer.from(salt, 'base64url'), expectedKey.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelism),
    maxmem: MAX_MEMORY,
  });
  return key.length === expectedKey.length && timingSafeEqual(key, expectedKey);
}

export function generatePassword(length = 20): string {
  return randomBytes(length * 2)
    .toString('base64url')
    .replace(/[-_]/g, '')
    .slice(0, length);
}
