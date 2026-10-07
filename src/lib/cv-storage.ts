import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

function encryptionKey() {
  const configured = process.env.CV_ENCRYPTION_KEY;
  if (!configured) {
    throw new Error("CV_ENCRYPTION_KEY is required to access CV storage");
  }
  const key = Buffer.from(configured, "hex");
  if (key.length !== 32) {
    throw new Error("CV_ENCRYPTION_KEY must be a 64-character hexadecimal key");
  }
  return key;
}

export function encryptCv(data: Uint8Array) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return {
    data: encrypted,
    iv,
    authTag: cipher.getAuthTag(),
  };
}

export function decryptCv(data: Uint8Array, iv: Uint8Array, authTag: Uint8Array) {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

export async function hasValidCvSignature(file: File) {
  const header = Buffer.from(await file.slice(0, 8).arrayBuffer());
  if (file.type === "application/pdf") {
    return header.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return header.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  }
  return false;
}
