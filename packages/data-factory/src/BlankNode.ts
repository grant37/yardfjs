import Term from './Term';

export default class BlankNode extends Term {
  get termType(): string {
    return 'BlankNode';
  }

  equals(other?: BlankNode): boolean {
    return super.equals(other) && other.value === this.value;
  }
}
