import { Quad, Term } from '@yardfjs/data-factory';
import { QuadIndex } from './utils';

/**
 * DatasetCore.
 */
export default class DatasetCore {
  protected quadIndex: QuadIndex;

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

  /**
   * Note: Blank nodes will be matched by provided identifier rather than normalized.
   */
  has(quad: Quad): boolean {
    return this.quadIndex.has(quad);
  }

  match(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term
  ): DatasetCore {
    const quadIndex = this.quadIndex.match(subject, predicate, object, graph);
    const dataSet = new DatasetCore();
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
