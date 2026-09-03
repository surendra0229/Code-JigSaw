import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'code-jigsaw-super-secret-admin-key-2026';

/**
 * Hashes a plaintext password securely using pbkdf2Sync.
 */
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Verifies a plaintext password against a stored hash.
 */
export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
};

/**
 * Creates a signed bearer token for admin authentication.
 */
export const createAdminToken = (payload: { id: string; email: string; userId: string; displayName?: string }, expiresInHours = 24): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = {
    id: payload.id,
    email: payload.email,
    userId: payload.userId,
    displayName: payload.displayName || 'Admin',
    role: 'admin',
    exp
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedBody = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedBody}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64url');

  return `${signatureInput}.${signature}`;
};

/**
 * Verifies and decodes an admin bearer token.
 */
export const verifyAdminToken = (token: string): { id: string; email: string; userId: string; displayName: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedBody, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedBody}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const bodyJson = Buffer.from(encodedBody, 'base64url').toString('utf-8');
    const body = JSON.parse(bodyJson);

    if (body.role !== 'admin') return null;
    if (body.exp && Math.floor(Date.now() / 1000) > body.exp) {
      return null; // Expired token
    }

    return {
      id: body.id,
      email: body.email || 'admin@example.com',
      userId: body.userId || 'admin123',
      displayName: body.displayName || 'Admin'
    };
  } catch {
    return null;
  }
};

/**
 * Creates a signed bearer token for player authentication.
 */
export const createPlayerToken = (payload: { id: string; playerName: string; email: string }, expiresInDays = 30): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 86400;
  const body = { ...payload, role: 'player', exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedBody = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedBody}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64url');

  return `${signatureInput}.${signature}`;
};

/**
 * Verifies and decodes a player bearer token.
 */
export const verifyPlayerToken = (token: string): { id: string; playerName: string; email: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedBody, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedBody}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const bodyJson = Buffer.from(encodedBody, 'base64url').toString('utf-8');
    const body = JSON.parse(bodyJson);

    if (body.role !== 'player') return null;
    if (body.exp && Math.floor(Date.now() / 1000) > body.exp) {
      return null; // Expired token
    }

    return { id: body.id, playerName: body.playerName, email: body.email };
  } catch {
    return null;
  }
};
