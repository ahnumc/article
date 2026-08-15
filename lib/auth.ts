import crypto from "node:crypto";
import { cookies } from "next/headers";
const secret = process.env.SESSION_SECRET || "development-secret";
const sign = (v: string) => crypto.createHmac("sha256", secret).update(v).digest("hex");
export function makeSession(userId: number) { const value = `${userId}.${Date.now()}`; return `${value}.${sign(value)}`; }
export async function currentUser() { const token = (await cookies()).get("news_session")?.value; if (!token) return null; const parts = token.split("."); if (parts.length !== 3 || sign(`${parts[0]}.${parts[1]}`) !== parts[2]) return null; return Number(parts[0]); }
export { sign };
