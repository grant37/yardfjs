import Term from './Term';

export default class Variable extends Term {
  readonly termType = 'Variable';

  equals(other?: Variable): boolean {
    return super.equals(other) && other.value === this.value;
  }
}
