import { describe, expect, it } from "vitest";
import { signPdf, ExternalSigner, addPlaceholder } from "../src";
import { PDFDocument } from "pdf-lib";
import {
  DEFAULT_SIGNATURE_LENGTH,
  extractSignature,
  SUBFILTER_ADOBE_PKCS7_DETACHED,
  SUBFILTER_ETSI_CADES_DETACHED,
} from "@signpdf/utils";
import { mockForgeSigner } from "./mocks/forge-signer";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

describe("signPdf() Orchestrator", () => {
  it("should return a signed PDF buffer containing the digital signature", async () => {
    // 1. Crear un PDF base
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage();
    const basePdf = await pdfDoc.save();

    // 2. Agregar el placeholder (necesario para que @signpdf sepa dónde firmar)
    const { pdfWithPlaceholder } = await addPlaceholder(basePdf, {
      name: "John Doe",
      reason: "Unit Testing",
      contactInfo: "contact@test.com",
      location: "Test Location",
      signatureLength: DEFAULT_SIGNATURE_LENGTH,
      subFilter: SUBFILTER_ETSI_CADES_DETACHED,
    });

    // 3. Instanciar el ExternalSigner con nuestro mock de node-forge
    const externalSigner = new ExternalSigner((hash) => mockForgeSigner(hash));

    // 4. Ejecutar la orquestación
    const signedPdf = await signPdf(
      Buffer.from(pdfWithPlaceholder),
      externalSigner,
    );

    // --- ASSERTIONS ---

    // El resultado debe ser un Buffer
    expect(signedPdf).toBeInstanceOf(Buffer);

    // El PDF firmado debe ser más grande que el original (debido a la firma incrustada)
    expect(signedPdf.length).toBeGreaterThan(basePdf.length);

    const { signature } = extractSignature(signedPdf);
    expect(signature).toBeDefined();

    // Verificamos que no sea solo ceros (el placeholder se llena con 000...)
    const isPlaceholderOnly = signature.replace(/0/g, "").length === 0;
    expect(isPlaceholderOnly).toBe(false);

    await mkdir(resolve("./src/tests/output/"), { recursive: true });
    await writeFile(resolve("./src/tests/output/test.pdf"), signedPdf);
  });

  it("should fail if the PDF does not have a placeholder", async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage();
    const pdfWithoutPlaceholder = await pdfDoc.save();

    const externalSigner = new ExternalSigner((hash) => mockForgeSigner(hash));

    // @signpdf lanzará un error si no encuentra /ByteRange o el placeholder
    await expect(
      signPdf(Buffer.from(pdfWithoutPlaceholder), externalSigner),
    ).rejects.toThrow();
  });
});
