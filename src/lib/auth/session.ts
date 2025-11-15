import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface SessionData {
  adminId: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

const SESSION_DURATION = 30 * 60;
const SESSION_COOKIE_NAME = 'fixit-admin-session';

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long');
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(adminData: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  try {
    const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);
    
    const token = await new SignJWT({
      adminId: adminData.id,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .sign(getSecretKey());

    return { 
      token, 
      expiresAt,
      cookieName: SESSION_COOKIE_NAME 
    };
  } catch (error) {
    console.error('Error in createSession:', error);
    throw error;
  }
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, getSecretKey());
    return verified.payload as unknown as SessionData;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export async function refreshSession() {
  try {
    const session = await getSession();
    
    if (!session) {
      return null;
    }

    return createSession({
      id: session.adminId,
      email: session.email,
      name: session.name,
      role: session.role,
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}

export async function deleteSession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

export async function shouldRefreshSession(): Promise<boolean> {
  try {
    const session = await getSession();
    
    if (!session) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = session.exp - now;
    
    return timeUntilExpiry < 5 * 60;
  } catch (error) {
    console.error('Error checking session refresh:', error);
    return false;
  }
}
