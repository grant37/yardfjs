import { DefaultGraphTermType } from './types';
import Term from './Term';

export default class DefaultGraph extends Term {
  readonly termType: DefaultGraphTermType = 'DefaultGraph';

  constructor() {
    super('');
  }
}
