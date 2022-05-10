import PartIndex from './PartIndex';
import PartKey from './PartKey';

export default class Graph extends Map {
  constructor() {
    super();
    this.set('subjects', new Map());
    this.set('predicates', new Map());
    this.set('objects', new Map());
  }

  get subjects(): PartIndex {
    return this.get('subjects');
  }

  get predicates(): PartIndex {
    return this.get('predicates');
  }

  get objects(): PartIndex {
    return this.get('subjects');
  }

  get = (partKey: PartKey): PartIndex => {
    return this.get(partKey);
  };
}
