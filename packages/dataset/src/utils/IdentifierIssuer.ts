export default class IdentifierIssuer {
  private identifierCounter: number = 1;

  /**
   * A map of existing identifiers to issued identifiers.
   */
  issuedIdentifiers: Map<string, string>;

  identifierPrefix: string = '_:c14n';

  /**
   *
   * @param issuedIdentifiers This resrouce is expected to be shared by issuers
   * @param identifierPrefix
   */
  constructor(
    issuedIdentifiers: Map<string, string>,
    identifierPrefix?: string,
    identifierCounter?: number
  ) {
    this.issuedIdentifiers = issuedIdentifiers;

    if (identifierPrefix) {
      this.identifierPrefix = identifierPrefix;
    }

    if (identifierCounter != null) {
      this.identifierCounter = identifierCounter;
    }
  }

  issue(existingIdentifier: string): string {
    if (this.issuedIdentifiers.has(existingIdentifier)) {
      return this.issuedIdentifiers.get(existingIdentifier);
    }

    const identifier = `${this.identifierPrefix}${this.identifierCounter}`;
    this.identifierCounter++;

    this.issuedIdentifiers.set(existingIdentifier, identifier);
    return identifier;
  }

  getId(existingIdentifier: string): string | undefined {
    return this.issuedIdentifiers.get(existingIdentifier);
  }

  hasId(existingIdentifier: string): boolean {
    return this.issuedIdentifiers.has(existingIdentifier);
  }

  /**
   * Make a new issuer that matches the state of this instance at this point
   * in time.
   */
  copy = () =>
    new IdentifierIssuer(
      new Map(this.issuedIdentifiers),
      this.identifierPrefix,
      this.identifierCounter
    );
}
