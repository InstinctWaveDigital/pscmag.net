/**
 * Edge-safe session utilities (no Node.js built-ins).
 * Used by middleware.ts and any Edge Runtime code.
 * Server-only auth (hashPassword, verifyPassword) stays in lib/auth.ts.
 */

const SECRET =
  process.env.SESSION_SECRET ||
  "e798e4d3dbbe8b9c8b746bb51bcf62b5d49a0d8a1c9377484df6d58ee9d49ad7";

export interface SessionPayload {
  userId: string;
  username: string;
  name: string;
  role: "admin" | "editor" | "writer";
  exp: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getCryptoKey(): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(SECRET));
  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptSession(
  payload: SessionPayload
): Promise<string> {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = encoder.encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const encryptedHex = Array.from(new Uint8Array(encrypted))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${ivHex}:${encryptedHex}`;
}

export async function decryptSession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const key = await getCryptoKey();
    const [ivHex, encryptedHex] = token.split(":");
    if (!ivHex || !encryptedHex) return null;

    const iv = new Uint8Array(
      ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const encrypted = new Uint8Array(
      encryptedHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );

    const payload = JSON.parse(decoder.decode(decrypted)) as SessionPayload;
    if (Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
