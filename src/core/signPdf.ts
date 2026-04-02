import { Signer, SignPdf } from "@signpdf/signpdf";

/**
 * Orchestrates the signing process by injecting a digital signature into a PDF placeholder.
 *
 * @param pdfBuffer - The PDF buffer containing the allocated /ByteRange placeholders.
 * @param signer - An instance of a Signer class (e.g., ExternalSigner) to handle the cryptographic operation.
 * @returns - A Promise that resolves to the fully signed PDF Buffer.
 */
export async function signPdf(pdfBuffer: Buffer, signer: Signer) {
  const { sign } = new SignPdf();
  const signedPdf = await sign(pdfBuffer, signer);
  return signedPdf;
}
