import { SoftlandCryptography } from "@/lib/auth/cs_softland_cryptography";

const crypto = new SoftlandCryptography();

export function cs_verifySoftlandPassword(
  plainPassword: string,
  encryptedPassword: string,
): boolean {
  try {
    const decrypted = crypto.decrypt(encryptedPassword, "");
    return (
      decrypted.trim().toLowerCase() === plainPassword.trim().toLowerCase()
    );
  } catch {
    return false;
  }
}
