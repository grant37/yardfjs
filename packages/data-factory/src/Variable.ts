import Term from './Term';

export default class Variable extends Term {
  get termType(): string {
    return 'Variable';
  }

  equals(other?: Variable): boolean {
    return super.equals(other) && other.value === this.value;
  }
}
