# @yumikodev/pades-bridge

A lightweight, high-level utility for PAdES-compliant digital signing in Node.js. This library acts as a bridge between your PDF documents and external signing providers (HSMs, Remote APIs, or Local Providers).

## Features

- **PAdES Compatible**: Generates PDF structures compatible with international standards (ETSI CAdES-detached).
- **External Signing Support**: Decouples the PDF processing from the cryptographic operation. Perfect for cloud HSMs (AWS CloudHSM, Azure Key Vault) or local providers.
- **Easy Placeholder Management**: Built-in helpers to add signature widgets and form fields to existing PDFs.
- **TypeScript First**: Full type safety for a better developer experience.

## Installation

```bash
pnpm add @yumikodev/pades-bridge
# or
npm install @yumikodev/pades-bridge
```

## Quick Start

### 1\. Add a Placeholder

First, prepare your PDF by adding a space for the signature.

```typescript
import {
  addPlaceholder,
  DEFAULT_SIGNATURE_LENGTH,
} from "@yumikodev/pades-bridge";

const { pdfWithPlaceholder } = await addPlaceholder(originalPdfBuffer, {
  reason: "Surgery Report Validation",
  contactInfo: "doctor@hospital.com",
  name: "Dr. Edwin Jibaja",
  location: "Lima, Peru",
  signatureLength: 8192, // Space reserved for the PKCS7 signature
  // or:
  // signatureLength: DEFAULT_SIGNATURE_LENGTH,
});
```

### 2\. Implement your External Signer

Create a handler that talks to your certificate provider.

```typescript
import { ExternalSigner } from "@yumikodev/pades-bridge";

// This function receives the SHA-256 hash of the PDF bytes
const myRemoteHSMHandler = async (hash: Buffer): Promise<Buffer> => {
  // 1. Send hash to your Provider API
  // 2. Receive the PKCS7/CMS signature
  return signatureFromProvider;
};

const signer = new ExternalSigner(myRemoteHSMHandler);
```

### 3\. Sign the PDF

Finally, merge everything into a valid signed PDF.

```typescript
import { signPdf } from "@yumikodev/pades-bridge";

const signedPdfBuffer = await signPdf(pdfWithPlaceholder, signer);
// signedPdfBuffer is now a valid PAdES-signed PDF
```

## API Reference

### `addPlaceholder(pdf, options)`

Prepares the document.

- **pdf**: `Buffer | Uint8Array`.
- **options**: Configuration for the signature field (reason, location, etc.).

### `ExternalSigner(handler)`

Class to handle the cryptographic part.

- **handler**: An async function `(hash: Buffer) => Promise<Buffer>`.

### `signPdf(pdfBuffer, signer)`

The main orchestrator that returns the final signed document.

## License

This project is licensed under the [**GPL-3.0**](LICENSE) License.

## Author

**Edwin Jibaja** - [GitHub](https://github.com/yumikodev), [Linktree](https://linktr.ee/edwinjibaja)

---

Open to contributions!
