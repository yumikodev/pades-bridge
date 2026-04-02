import { BinaryLike, createHash } from "node:crypto";

/**
 * Generates a SHA-256 hash from one or multiple data chunks.
 *
 * @param data - The data parts (Buffers, strings, or TypedArrays) to be hashed.
 * @returns The resulting 32-byte SHA-256 digest as a Buffer.
 */
export function getSHA256(...data: BinaryLike[]): Buffer {
  const hmac = createHash("sha256");
  for (const part of data) {
    hmac.update(part);
  }
  return hmac.digest();
}
