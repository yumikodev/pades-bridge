import { InputType, pdflibAddPlaceholder } from "@signpdf/placeholder-pdf-lib";
import { PDFDocument } from "pdf-lib";

/**
 * Loads a PDF and prepares it for signing by adding a Signature Form field and ByteRange placeholders.
 *
 * @param pdf - The source PDF file as a path, ArrayBuffer, or Uint8Array.
 * @param inputType - Configuration options for the placeholder (reason, contact, subFilter, etc.).
 * @returns An object containing the modified PDF in both ArrayBuffer and Buffer formats.
 */
export async function addPlaceholder(
  pdf: string | ArrayBuffer | Uint8Array,
  inputType: Omit<InputType, "pdfDoc">,
) {
  const pdfDoc = await PDFDocument.load(pdf);

  pdflibAddPlaceholder({
    pdfDoc,
    ...inputType,
  });

  const pdfArrayBuffer = await pdfDoc.save();
  const pdfWithPlaceholder = Buffer.from(pdfArrayBuffer);

  return {
    pdfArrayBuffer,
    pdfWithPlaceholder,
  };
}
