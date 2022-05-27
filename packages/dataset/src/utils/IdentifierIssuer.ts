export default class IdentifierIssuer {
  private identifierPrefix?: string = 'c14n';

  private identifierCounter: number = 1;

  ids: string[];

  constructor(identifierPrefix?: string) {
    if (identifierPrefix) {
      this.identifierPrefix = identifierPrefix;
    }
  }

  issue(): string {
    const identifier = `${this.identifierPrefix}${this.identifierCounter}`;
    this.identifierCounter++;
    this.ids.push(identifier);
    return identifier;
  }
}
