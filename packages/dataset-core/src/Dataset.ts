import { Quad, Term } from '@yardfjs/data-factory';
import { QuadIndex } from './utils';

/**
 * Dataset.
 */
export default class Dataset {
  private quadIndex: QuadIndex;

  constructor() {
    this.quadIndex = new QuadIndex();
  }

  add(quad: Quad): this {
    this.quadIndex.add(quad);
    return this;
  }

  delete(quad: Quad): this {
    this.quadIndex.delete(quad);
    return this;
  }

  has(quad: Quad): boolean {
    return this.quadIndex.has(quad);
  }

  match(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term
  ): Dataset {
    const quadIndex = this.quadIndex.match(subject, predicate, object, graph);
    const dataSet = new Dataset();
    dataSet.quadIndex = quadIndex;
    return dataSet;
  }

  [Symbol.iterator](): Iterator<Quad> {
    return this.quadIndex[Symbol.iterator]();
  }

  get size(): number {
    return this.quadIndex.size;
  }
}
