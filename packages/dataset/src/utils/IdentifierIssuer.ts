export default class IdentifierIssuer {
  private identifierCounter: number = 1;

  issuedIdentifiers: Map<string, string>;

  identifierPrefix: string = '_:c14n';

  /**
   *
   * @param issuedIdentifiers This resrouce is expected to be shared by issuers
   * @param identifierPrefix
   */
  constructor(
    issuedIdentifiers: Map<string, string>,
    identifierPrefix?: string
  ) {
    this.issuedIdentifiers = issuedIdentifiers;
    if (identifierPrefix) {
      this.identifierPrefix = identifierPrefix;
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
}
