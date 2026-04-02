import { describe, expect, it } from "vitest";
import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFSignature,
  PDFString,
} from "pdf-lib";
import { addPlaceholder } from "../core/addPlaceholder";

async function createMockPdf() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage();
  const mockPdf = await pdfDoc.save();
  return mockPdf;
}

describe("addPlaceholder()", () => {
  it("should not have a signature placeholder", async () => {
    const mockPdf = await createMockPdf();
    const mockPdfDoc = await PDFDocument.load(mockPdf);

    expect(
      mockPdfDoc
        .getForm()
        .getFields()
        .some((f) => f instanceof PDFSignature),
    ).toBe(false);
  });

  it("should be add signature placeholder", async () => {
    const mockPdf = await createMockPdf();

    const inputData = {
      name: "John Doe",
      reason: "Tesing placeholder",
      contactInfo: "contact@test.com",
      location: "Test Location",
    };

    const { pdfArrayBuffer, pdfWithPlaceholder } = await addPlaceholder(
      mockPdf,
      inputData,
    );

    expect(pdfArrayBuffer).toBeInstanceOf(Uint8Array);
    expect(pdfWithPlaceholder).toBeInstanceOf(Buffer);

    const doc = await PDFDocument.load(pdfWithPlaceholder);
    const fields = doc.getForm().getFields();

    const signatureField = fields.find((f) => f instanceof PDFSignature);
    expect(signatureField).toBeDefined();

    const acroField = signatureField!.acroField;

    const dictionary = acroField.V() as PDFDict;

    const name = dictionary.get(PDFName.of("Name")) as PDFString;
    const reason = dictionary.get(PDFName.of("Reason")) as PDFString;
    const contactInfo = dictionary.get(PDFName.of("ContactInfo")) as PDFString;
    const location = dictionary.get(PDFName.of("Location")) as PDFString;

    expect(name.decodeText()).toBe(inputData.name);
    expect(reason.decodeText()).toBe(inputData.reason);
    expect(contactInfo.decodeText()).toBe(inputData.contactInfo);
    expect(location.decodeText()).toBe(inputData.location);
  });
});
