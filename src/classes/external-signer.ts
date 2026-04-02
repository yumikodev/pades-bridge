import { Signer } from "@signpdf/signpdf";
import { getSHA256 } from "../helpers/getSHA256";

/**
 * Callback definition for external signing operations.
 * Receives the SHA-256 hash of the PDF and expects a PKCS#7/CMS signature buffer in return.
 */
export type ExternalHandlerFunction = (hash: Buffer) => Promise<Buffer>;

/**
 * A custom Signer implementation that delegates the cryptographic signing
 * to an external handler (e.g., a Cloud HSM, a remote API, or a hardware token).
 *
 * @extends Signer
 */
export class ExternalSigner extends Signer {
  /**
   * Creates an instance of ExternalSigner.
   * @param externalHandler - The function that handles the remote signing logic.
   */
  constructor(private externalHandler: ExternalHandlerFunction) {
    super();
  }

  /**
   * Performs the signing operation required by the SignPdf library.
   * Automatically calculates the SHA-256 hash of the relevant PDF bytes before calling the external handler.
   *
   * @param pdfBuffer - The processed PDF bytes (excluding the signature hole) provided by @signpdf/signpdf.
   * @returns The signature buffer to be injected into the PDF.
   * @override
   */
  override async sign(pdfBuffer: Buffer): Promise<Buffer> {
    const pdfHash = getSHA256(pdfBuffer);
    const signatureBuffer = await this.externalHandler(pdfHash);
    return signatureBuffer;
  }
}
