// 익명 댓글/방명록용 비밀번호 해시 — Web Crypto PBKDF2(Workers-safe, bcrypt 불필요).
// 저장 형식: "<saltHex>:<hashHex>".
const ITERATIONS = 100_000;

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// salt는 ArrayBuffer 백킹으로 고정(TS 5.7 Uint8Array 제네릭 ↔ Web Crypto BufferSource).
async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${toHex(salt)}:${await derive(password, salt)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  // ponytail: 문자열 비교(비상수시간). 댓글 비번 저위험이라 충분 — 민감해지면 상수시간 비교로.
  return (await derive(password, fromHex(saltHex))) === hashHex;
}
