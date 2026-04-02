import { describe, expect, it } from "vitest";
import { getSHA256 } from "../src/helpers/getSHA256";

describe("getSHA256()", () => {
  it("should be instance of buffer", () => {
    const hash = getSHA256("abcde");

    expect(hash).toBeInstanceOf(Buffer);
  });

  it("should be a valid hash", () => {
    const hash1 = getSHA256(Buffer.from([0, 1, 2, 3]));
    const hash2 = getSHA256(Buffer.from([0, 1, 2, 3]));

    expect(hash1.toString("hex") === hash2.toString("hex")).toBe(true);
  });

  it("should be diferent hashes", () => {
    const hash1 = getSHA256(Buffer.from([0, 1, 2, 3]));
    const hash2 = getSHA256(Buffer.from([0, 1, 2, 4]));

    expect(hash1.toString("hex") === hash2.toString("hex")).toBe(false);
  });
});
