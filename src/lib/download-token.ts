import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from './env';

/**
 * Download links are HMAC-signed and short-lived. The link alone is not
 * sufficient to download — /api/download re-checks that the signed-in user
 * owns a PAID order containing the item — but signing means a leaked URL
 * also stops working on its own.
 */
const TTL_MS = 15 * 60 * 1000;

function sign(payload: string) {
  return createHmac('sha256', env().DOWNLOAD_TOKEN_SECRET)
    .update(payload)
    .digest('base64url');
}

export function createDownloadToken(orderItemId: string, fileIndex: number) {
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${orderItemId}.${fileIndex}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export type DownloadClaim = { orderItemId: string; fileIndex: number };

export function verifyDownloadToken(token: string): DownloadClaim | null {
  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [orderItemId, rawIndex, rawExpiry, signature] = parts;
  const payload = `${orderItemId}.${rawIndex}.${rawExpiry}`;

  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length) return null;
  if (!timingSafeEqual(expected, provided)) return null;

  const expiresAt = Number(rawExpiry);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  const fileIndex = Number(rawIndex);
  if (!Number.isInteger(fileIndex) || fileIndex < 0) return null;

  return { orderItemId, fileIndex };
}
