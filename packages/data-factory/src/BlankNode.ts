import { BlankNodeTermType } from './types';
import Term from './Term';

export default class BlankNode extends Term {
  readonly termType: BlankNodeTermType = 'BlankNode';

  equals(other?: BlankNode): boolean {
    return super.equals(other) && other.value === this.value;
  }
}
