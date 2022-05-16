export default abstract class Term {
  constructor(readonly value: string) {}

  abstract termType: string;

  equals(other?: Term): boolean {
    return (
      other !== null && other !== undefined && other.termType === this.termType
    );
  }
}
