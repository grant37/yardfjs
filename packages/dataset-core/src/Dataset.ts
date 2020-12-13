import { DefaultGraph, Quad, Term } from '@yardfjs/data-factory';
import { indexQuad, initGraph, toKey } from './util';
import { GraphIndex } from './types';

const DEFAULT_GRAPH: DefaultGraph = new DefaultGraph();
const DEFAULT_GRAPH_ID: number = 1;

export default class Dataset {
  readonly size: number = 0;

  // The internals are inspired by N3.
  private termID: number = 1;

  private internalIDsByValues: Map<string, number> = new Map([
    [DEFAULT_GRAPH.value, DEFAULT_GRAPH_ID],
  ]);

  private valuesByInternalIDs: Map<number, string> = new Map([
    [DEFAULT_GRAPH_ID, DEFAULT_GRAPH.value],
  ]);

  // Redundant, probably reconsider.
  private termsByInternalIDs: Map<number, Term> = new Map([
    [DEFAULT_GRAPH_ID, DEFAULT_GRAPH],
  ]);

  private graphs: GraphIndex = new Map([[DEFAULT_GRAPH_ID, new Map()]]);

  private indexTerm(key: string, term: Term): number {
    const nextID = ++this.termID;
    this.internalIDsByValues.set(key, nextID);
    this.valuesByInternalIDs.set(nextID, key);
    this.termsByInternalIDs.set(nextID, term);
    return nextID;
  }

  private toID(term: Term, options = { shouldIndex: false }): number {
    const key = toKey(term);
    if (this.internalIDsByValues.has(key)) {
      return this.internalIDsByValues.get(key);
    }
    if (options.shouldIndex) {
      return this.indexTerm(key, term);
    }
    return -1;
  }

  // private fromID(id: number): Term {
  //   if (!this.termsByInternalIDs.has(id)) {
  //     throw new Error(`Unable to find term with internal id ${id}`);
  //   }
  //   return this.termsByInternalIDs.get(id);
  // }

  add({ subject, predicate, object, graph }: Quad): Dataset {
    const [s, p, o, g] = [
      this.toID(subject),
      this.toID(predicate),
      this.toID(object),
      this.toID(graph),
    ];
    if (!this.graphs.has(g)) this.graphs.set(g, initGraph());
    indexQuad(this.graphs.get(g), s, p, o);
    return this;
  }

  delete(quad: Quad): Dataset {
    // stub
    return quad ? this : this;
  }

  has({ subject, predicate, object, graph }: Quad): boolean {
    const graphKey = this.toID(graph);
    if (graphKey === -1) return false;
    const subjectKey = this.toID(subject);
    if (subjectKey === -1) return false;
    const predicateKey = this.toID(predicate);
    if (predicateKey === -1) return false;
    const objectKey = this.toID(object);
    if (objectKey === -1) return false;

    return this.graphs
      .get(graphKey)
      .get('subjects')
      .get(subjectKey)
      .get(predicateKey)
      .has(objectKey);
  }

  match(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term
  ): Dataset {
    // stub
    if (subject && predicate && object && graph && this.size)
      return new Dataset();
    return new Dataset();
  }
}
