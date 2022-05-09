import Term from './Term';

export default class NamedNode extends Term {
  get termType(): NamedNodeTermType {
    return 'NamedNode';
  }

  equals(other?: NamedNode): boolean {
    return super.equals(other) && other.value === this.value;
  }
}
