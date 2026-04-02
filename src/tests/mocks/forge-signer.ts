import forge from "node-forge";

export async function mockForgeSigner(hash: Buffer): Promise<Buffer> {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";

  const now = new Date();
  cert.validity.notBefore = now;
  cert.validity.notAfter = new Date(now);
  cert.validity.notAfter.setFullYear(now.getFullYear() + 1);

  const attrs = [
    { name: "commonName", value: "Test Signer" },
    { name: "organizationName", value: "Dev Mock Lab" },
    { name: "countryName", value: "PE" },
  ];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  cert.setExtensions([
    { name: "basicConstraints", cA: false },
    { name: "keyUsage", digitalSignature: true, nonRepudiation: true },
    { name: "extKeyUsage", emailProtection: true, timeStamping: true },
  ]);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const p7 = forge.pkcs7.createSignedData();

  p7.content = forge.util.createBuffer(hash.toString("hex"));

  p7.addCertificate(cert);
  p7.addSigner({
    key: keys.privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
    ],
  });

  p7.sign({ detached: true });

  const derRaw = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return Buffer.from(derRaw, "binary");
}
