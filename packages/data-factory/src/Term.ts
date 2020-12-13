import { TermType } from './types';

export default abstract class Term {
  readonly termType: TermType;

  constructor(readonly value: string) {}

  equals(other?: Term): boolean {
    return (
      other !== null && other !== undefined && other.termType === this.termType
    );
  }
}
