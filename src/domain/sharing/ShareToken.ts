/**
 * The opaque string a viewer's URL carries — never the sessionId itself
 * (Security: "Never expose internal IDs"). Same validation whether the
 * token was just generated or arrived from the outside world; untrusted
 * input gets no special leniency.
 */
export class ShareToken {
  private constructor(public readonly value: string) {}

  static fromGenerated(value: string): ShareToken {
    return ShareToken.validate(value);
  }

  static parse(raw: string): ShareToken {
    return ShareToken.validate(raw);
  }

  private static validate(value: string): ShareToken {
    if (!value || value.length < 16) {
      throw new Error("Invalid share token");
    }
    return new ShareToken(value);
  }
}
