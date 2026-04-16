import { createHash } from 'crypto';

export function generateCacheKey(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex');
}
