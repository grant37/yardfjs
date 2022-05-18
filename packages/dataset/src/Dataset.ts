import { Quad, Term } from '@yardfjs/data-factory';
import { DatasetCore } from '@yardfjs/dataset-core';

export default class Dataset extends DatasetCore {
  match(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term
  ): Dataset {
    const matches = this.quadIndex.match(subject, predicate, object, graph);
    const dataset = new Dataset();
    dataset.quadIndex = matches;
    return dataset;
  }

  addAll(quads: Dataset | DatasetCore | ArrayLike<Quad>): this {
    Array.from(quads).forEach((quad) => {
      this.add(quad);
    });

    return this;
  }

  deleteMatches(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term
  ): this {
    const matching = this.match(subject, predicate, object, graph);
    Array.from(matching).forEach((quad) => {
      this.delete(quad);
    });

    return this;
  }

  // https://json-ld.github.io/rdf-dataset-canonicalization/spec/#canonicalization
  contains(): boolean {
    // stub
    return false;
  }

  equals(): boolean {
    // stub
    return false;
  }

  union(other: Dataset | DatasetCore): Dataset {
    const union = new Dataset();

    this.forEach((quad) => {
      union.add(quad);
    });

    Array.from(other).forEach((quad) => {
      union.add(quad);
    });

    return union;
  }

  difference(other: Dataset | DatasetCore): Dataset {
    return this.reduce(
      (acc, quad) => (!other.has(quad) ? acc.add(quad) : acc),
      new Dataset()
    );
  }

  intersection(other: Dataset | DatasetCore): Dataset {
    return this.reduce(
      (acc, quad) => (other.has(quad) ? acc.add(quad) : acc),
      new Dataset()
    );
  }

  async import(stream: ReadableStream<Quad>): Promise<this> {
    const reader = stream.getReader();
    let data = await reader.read();

    try {
      while (!data.done) {
        if (!data.value) {
          throw new TypeError('Import received an empty chunk');
        }

        this.add(data.value);
        data = await reader.read();
      }
    } catch (error) {
      reader.cancel(error);
      throw error;
    }

    reader.releaseLock();
    return this;
  }

  forEach(callback: (quad: Quad, dataset: this) => void): void {
    Array.from(this).forEach((quad) => {
      callback(quad, this);
    });
  }

  reduce(
    callback: (accumulator: any, quad: Quad, dataset: this) => any,
    initialValue?: any
  ): any {
    return Array.from(this).reduce(
      (acc, quad) => callback(acc, quad, this),
      initialValue
    );
  }

  filter(callback: (quad: Quad, dataset: this) => boolean): Dataset {
    return this.reduce(
      (acc, quad) => (callback(quad, this) ? acc.add(quad) : acc),
      new Dataset()
    );
  }

  some(callback: (quad: Quad, dataset: this) => boolean): boolean {
    return Array.from(this).some((quad) => callback(quad, this));
  }

  every(callback: (quad: Quad, dataset: this) => boolean): boolean {
    return Array.from(this).every((quad) => callback(quad, this));
  }
}
