import Term from './Term';

export default class DefaultGraph extends Term {
  static get termType(): DefaultGraphTermType {
    return 'DefaultGraph';
  }

  get termType(): DefaultGraphTermType {
    return DefaultGraph.termType;
  }

  constructor() {
    super('');
  }
}
