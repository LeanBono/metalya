import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE = 'metalya_admin';
function secret(){ return process.env.ADMIN_SECRET || 'CHANGE_ME_IN_PRODUCTION'; }
function token(){ return crypto.createHmac('sha256', secret()).update('metalya-admin').digest('hex'); }
export async function isAdmin(){ return (await cookies()).get(COOKIE)?.value === token(); }
export async function setAdmin(){ const store=await cookies(); store.set(COOKIE, token(), { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:60*60*8 }); }
export async function clearAdmin(){ (await cookies()).delete(COOKIE); }
