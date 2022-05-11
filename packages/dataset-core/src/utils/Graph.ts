import PartIndex from './PartIndex';
import PartKey from './PartKey';
import SecondPartIndex from './SecondPartIndex';
import ThirdPartIndex from './ThirdPartIndex';

export default class Graph extends Map {
  id: number;

  constructor(id: number) {
    super();
    this.id = id;
    this.set('subjects', new PartIndex('subjects', id));
    this.set('predicates', new PartIndex('predicates', id));
    this.set('objects', new PartIndex('objects', id));
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

  addTerm(sId: number, pId: number, oId: number): void {
    this.indexParts('subjects', sId, pId, oId);
    this.indexParts('predicates', pId, oId, sId);
    this.indexParts('objects', sId, oId, pId);
  }

  private indexParts = (partKey: PartKey, ...parts: number[]): void => {
    const [id1, id2, id3] = parts;
    switch (true) {
      case !this[partKey].has(id1):
        this[partKey].set(
          id1,
          new SecondPartIndex([[id2, new ThirdPartIndex([id3])]])
        );
        break;
      case !this[partKey].get(id1).has(id2):
        this[partKey].get(id1).set(id2, new ThirdPartIndex([id3]));
        break;
      default:
        this[partKey].get(id1).get(id2).add(id3);
    }
  };
}
