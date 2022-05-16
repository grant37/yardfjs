import Term from './Term';

export default class DefaultGraph extends Term {
  static get termType(): string {
    return 'DefaultGraph';
  }

  get termType(): string {
    return DefaultGraph.termType;
  }

  constructor() {
    super('');
  }
}
