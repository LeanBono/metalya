import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'metalya_admin';
const USER_COOKIE = 'metalya_admin_user';

function secret() {
  return process.env.ADMIN_SECRET || 'CHANGE_ME_IN_PRODUCTION';
}

function hashPassword(password: string) {
  return crypto.createHmac('sha256', secret()).update(password).digest('hex');
}

/** Contraseña única legacy: ADMIN_PASSWORD o metalya-admin-2026 */
function legacyPasswords(): string[] {
  const raw = process.env.ADMIN_PASSWORD || 'metalya-admin-2026';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Multi-usuario vía env:
 * ADMIN_USERS=admin:clave1,operador:clave2
 * Si no hay, solo se valida ADMIN_PASSWORD / default.
 */
function envUsers(): { username: string; password: string; role: string }[] {
  const raw = process.env.ADMIN_USERS || '';
  if (!raw.trim()) return [];
  return raw.split(',').map((pair) => {
    const [username, password, role] = pair.split(':').map((s) => s.trim());
    return {
      username: username || 'admin',
      password: password || '',
      role: role || 'admin',
    };
  }).filter((u) => u.password);
}

function sessionToken(username: string) {
  return crypto.createHmac('sha256', secret()).update(`metalya-admin:${username}`).digest('hex');
}

export async function isAdmin() {
  const store = await cookies();
  const tok = store.get(COOKIE)?.value;
  if (!tok) return false;
  const user = store.get(USER_COOKIE)?.value || 'admin';
  return tok === sessionToken(user);
}

export async function getAdminUser(): Promise<{ username: string; role: string } | null> {
  if (!(await isAdmin())) return null;
  const store = await cookies();
  const username = store.get(USER_COOKIE)?.value || 'admin';
  const users = envUsers();
  const found = users.find((u) => u.username === username);
  return { username, role: found?.role || 'admin' };
}

export async function tryLogin(password: string, username?: string): Promise<boolean> {
  const users = envUsers();
  if (users.length && username) {
    const u = users.find((x) => x.username === username && x.password === password);
    if (!u) return false;
    await setAdminSession(u.username);
    return true;
  }
  // Legacy: solo password
  if (legacyPasswords().includes(password)) {
    await setAdminSession(username || 'admin');
    return true;
  }
  return false;
}

export async function setAdminSession(username: string) {
  const store = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 12,
  };
  store.set(COOKIE, sessionToken(username), opts);
  store.set(USER_COOKIE, username, opts);
}

/** @deprecated use setAdminSession */
export async function setAdmin() {
  await setAdminSession('admin');
}

export async function clearAdmin() {
  const store = await cookies();
  store.delete(COOKIE);
  store.delete(USER_COOKIE);
}

export { hashPassword };
