import { DefaultGraph, Quad, Term } from '@yardfjs/data-factory';
import { indexQuad, initGraph, toKey } from './utils';

const DEFAULT_GRAPH: DefaultGraph = new DefaultGraph();
const DEFAULT_GRAPH_ID: number = 1;

export default class Dataset {
  private currentSize: number = 0;

  get size(): number {
    return this.currentSize;
  }

  private lastID: number = 1;

  private ids: Map<string, number> = new Map([
    [DEFAULT_GRAPH.value, DEFAULT_GRAPH_ID],
  ]);

  private values: Map<number, string> = new Map([
    [DEFAULT_GRAPH_ID, DEFAULT_GRAPH.value],
  ]);

  private graphs: GraphIndex = new Map([[DEFAULT_GRAPH_ID, initGraph()]]);

  private generateTermID(key: string): number {
    const nextID = ++this.lastID;
    this.ids.set(key, nextID);
    this.values.set(nextID, key);
    return nextID;
  }

  private toID(term: Term, canCreate: boolean = false): number {
    const key = toKey(term);
    if (this.ids.has(key)) return this.ids.get(key);
    if (canCreate) {
      return this.generateTermID(key);
    }
    return -1;
  }

  private quadToIDs(quad: Quad, canCreate: boolean = false): Array<number> {
    return [
      this.toID(quad.subject, canCreate),
      this.toID(quad.predicate, canCreate),
      this.toID(quad.object, canCreate),
      this.toID(quad.graph, canCreate),
    ];
  }

  // private fromID(id: number): Term {
  //   if (!this.terms.has(id)) {
  //     throw new Error(`Unable to find term with internal id ${id}`);
  //   }
  //   return this.terms.get(id);
  // }

  /**
   * Expects IDs in order subject, predicate, object, graph.
   * @param   ids number[]
   * @returns Boolean
   */
  private hasQuad(termIds: number[]): boolean {
    if (termIds.some((id) => id === -1)) {
      return false;
    }

    const [s, p, o, g] = termIds;

    return !!this.graphs.get(g)?.get('subjects')?.get(s)?.get(p)?.has(o);
  }

  has(quad: Quad): boolean {
    const ids = this.quadToIDs(quad);
    return this.hasQuad(ids);
  }

  add(quad: Quad): Dataset {
    if (this.has(quad)) {
      return this;
    }

    const [s, p, o, g] = this.quadToIDs(quad, true);

    if (!this.graphs.has(g)) {
      this.graphs.set(g, initGraph());
    }

    indexQuad(this.graphs.get(g), s, p, o);

    this.currentSize++;
    return this;
  }

  delete(quad: Quad): Dataset {
    const ids = this.quadToIDs(quad, true);
    if (!this.hasQuad(ids)) {
      return this;
    }

    return quad ? this : this;
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
