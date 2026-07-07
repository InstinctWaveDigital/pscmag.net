/**
 * Server-only auth utilities.
 * Password hashing/verification (Node.js crypto) and cookie session management.
 * Do NOT import this in middleware.ts — use lib/session.ts there instead.
 */

import { cookies } from "next/headers";
import crypto from "crypto";
import {
  encryptSession,
  decryptSession,
  SessionPayload,
} from "./session";

// Re-export SessionPayload so callers only need one import
export type { SessionPayload };
export { encryptSession, decryptSession };

// ─── Password Hashing (Node.js crypto — server-only) ───
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(testHash, "hex")
    );
  } catch {
    return false;
  }
}

// ─── Cookie Session Managers ───
const COOKIE_NAME = "apsc_session";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decryptSession(token);
}

export async function setSession(
  payload: Omit<SessionPayload, "exp">
): Promise<void> {
  const cookieStore = await cookies();
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const token = await encryptSession({ ...payload, exp });

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: exp,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
