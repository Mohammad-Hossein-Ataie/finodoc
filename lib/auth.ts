import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key_change_me';
const key = new TextEncoder().encode(SECRET_KEY);

function normalizeUserIdToString(userId: unknown): string | undefined {
  if (!userId) return undefined;
  if (typeof userId === 'string') return userId;

  // Mongoose ObjectId typically implements toString() -> 24-hex.
  const asAny = userId as any;
  if (typeof asAny?.toString === 'function') {
    const str = asAny.toString();
    if (typeof str === 'string' && str !== '[object Object]') return str;
  }

  // Legacy/serialized forms we might see in JWT payloads.
  // Example from logs: { buffer: { '0': 104, ... '11': 199 } }
  if (asAny?.buffer && typeof asAny.buffer === 'object') {
    const bytes = Object.values(asAny.buffer).filter(v => typeof v === 'number') as number[];
    if (bytes.length === 12) {
      // ObjectId is 12 bytes -> 24 hex chars.
      return Buffer.from(bytes).toString('hex');
    }
  }

  // Common extended JSON: { $oid: "..." }
  if (typeof asAny?.$oid === 'string') return asAny.$oid;

  return undefined;
}

function normalizeSessionPayload(payload: any) {
  if (!payload || typeof payload !== 'object') return payload;
  const normalizedUserId = normalizeUserIdToString(payload.userId);
  if (normalizedUserId) payload.userId = normalizedUserId;
  return payload;
}

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return normalizeSessionPayload(payload);
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  return normalizeSessionPayload(session);
}

export async function login(payload: any) {
  const safePayload = { ...payload };
  const normalizedUserId = normalizeUserIdToString(safePayload.userId);
  if (normalizedUserId) safePayload.userId = normalizedUserId;

  const token = await signToken(safePayload);
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export async function logout() {
  cookies().set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
}
