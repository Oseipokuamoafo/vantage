// Prototype-grade password hashing: salted SHA-256 via Web Crypto.
// A real deployment must use a managed auth provider instead (see docs/ARCHITECTURE.md).

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function makeSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  if (!crypto?.subtle) {
    throw new Error('Secure hashing is unavailable. Open Vantage over https or localhost.');
  }
  const data = new TextEncoder().encode(`${salt}:${password}`);
  return toHex(await crypto.subtle.digest('SHA-256', data));
}
