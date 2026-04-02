import { describe, expect, it, vi } from "vitest";
import { ExternalSigner } from "../src/classes/externalSigner";
import { Signer } from "@signpdf/signpdf";
import { getSHA256 } from "../src/helpers/getSHA256";

describe("ExternalSigner", () => {
  it("should be an instance of Signer", () => {
    const signer = new ExternalSigner(async (hash) => hash);
    expect(signer).toBeInstanceOf(Signer);
  });

  it("should call the handler with the correct SHA-256 hash of the input buffer", async () => {
    // 1. Preparamos datos de prueba
    const mockPdfBytes = Buffer.from("fake-pdf-bytes-from-byte-range");
    const expectedHash = getSHA256(mockPdfBytes);

    // 2. Creamos un mock del handler para espiar qué recibe
    const handler = vi.fn().mockResolvedValue(Buffer.from("mock-signature"));
    const signer = new ExternalSigner(handler);

    // 3. Ejecutamos el método sign
    const result = await signer.sign(mockPdfBytes);

    // 4. Verificaciones
    // Comprobamos que el handler recibió el hash correcto
    expect(handler).toHaveBeenCalledWith(expectedHash);
    // Comprobamos que lo que devuelve el signer es lo que devolvió el handler
    expect(result.toString()).toBe("mock-signature");
  });

  it("should throw if the external handler fails", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("Connection failed"));
    const signer = new ExternalSigner(handler);

    await expect(signer.sign(Buffer.from("data"))).rejects.toThrow(
      "Connection failed",
    );
  });
});
