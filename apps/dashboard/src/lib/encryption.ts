import crypto from "crypto";
import fs from "fs";
const KEY_PATH = process.env.ENCRYPTION_KEY_PATH || "./.clouddory_encryption_key";
const ALGORITHM = "aes-256-cbc";

function getKey(): Buffer {
  if (!fs.existsSync(KEY_PATH)) {
    const key = crypto.randomBytes(32);
    fs.writeFileSync(KEY_PATH, key.toString("hex"), { mode: 0o600 });
    return key;
  }
  return Buffer.from(fs.readFileSync(KEY_PATH, "utf-8").trim(), "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}

export function decrypt(encrypted: string): string {
  const key = getKey();
  const [ivBase64, ciphertext] = encrypted.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
