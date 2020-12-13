import { NamedNodeTermType } from './types';
import Term from './Term';

export default class NamedNode extends Term {
  readonly termType: NamedNodeTermType = 'NamedNode';

  equals(other?: NamedNode): boolean {
    return super.equals(other) && other.value === this.value;
  }
}
