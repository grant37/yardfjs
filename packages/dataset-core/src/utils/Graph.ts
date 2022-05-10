export type SecondPartIndex = Map<number, Set<number>>;
export type PartKey = 'subjects' | 'predicates' | 'objects';

export default class Graph extends Map {
  constructor() {
    super();
    this.set('subjects', new Map());
    this.set('predicates', new Map());
    this.set('objects', new Map());
  }

  get subjects(): SecondPartIndex {
    return this.get('subjects');
  }

  get predicates(): SecondPartIndex {
    return this.get('predicates');
  }

  get objects(): SecondPartIndex {
    return this.get('subjects');
  }
}
