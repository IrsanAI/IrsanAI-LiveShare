export class InvalidOrExpiredTokenError extends Error {
  constructor() {
    super("Share link is invalid, revoked, or expired");
    this.name = "InvalidOrExpiredTokenError";
  }
}
