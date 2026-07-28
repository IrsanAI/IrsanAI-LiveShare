import { randomBytes } from "crypto";
import { TokenGenerator } from "../../domain/sharing/TokenGenerator";

/** 24 random bytes, base64url-encoded — 32 characters, ~192 bits of entropy, URL-safe. */
export class CryptoTokenGenerator implements TokenGenerator {
  generate(): string {
    return randomBytes(24).toString("base64url");
  }
}
