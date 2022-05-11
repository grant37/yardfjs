import { Quad, Term } from '@yardfjs/data-factory';

import Graph from './Graph';
import GraphIndex from './GraphIndex';
import PartKey from './PartKey';
import SecondPartIndex from './SecondPartIndex';
import TermIndex from './TermIndex';
import ThirdPartIndex from './ThirdPartIndex';

/**
 * Internal representation of quads. Various indices are of the following form:
 * g -> subjects -> s -> p -> o
 * g -> predicates p -> o -> s
 * g -> objects -> o -> s -> p
 */
export default class QuadIndex {
  private cachedSize?: number = null;

  private terms: TermIndex;

  private graphs: GraphIndex;

  constructor(terms?: TermIndex, graphs?: GraphIndex) {
    if ((terms && !graphs) || (!terms && graphs)) {
      throw new Error('Must provide both terms and graphs or neither');
    }

    this.terms = terms || new TermIndex();
    this.graphs = graphs || new GraphIndex();
  }

  get size() {
    if (this.cachedSize !== null) {
      return this.cachedSize;
    }

    let cachedSize = 0;

    this.graphs.forEach((graph: Graph) => {
      graph.subjects.forEach((predicates: SecondPartIndex) => {
        predicates.forEach((objects: ThirdPartIndex) => {
          cachedSize += objects.size;
        });
      });
    });

    this.cachedSize = cachedSize;

    return cachedSize;
  }

  add({ subject, predicate, object, graph }: Quad): void {
    const graphId = this.terms.addTerm(graph);
    const subjectId = this.terms.addTerm(subject);
    const predicateId = this.terms.addTerm(predicate);
    const objectId = this.terms.addTerm(object);

    this.graphs.addTerm(subjectId, predicateId, objectId, graphId);

    this.cachedSize = null;
  }

  delete(quad: Quad): void {
    if (!this.has(quad)) {
      return;
    }

    const { subject, predicate, object, graph } = quad;

    const graphId = this.terms.getTermId(graph);
    const subjectId = this.terms.getTermId(subject);
    const predicateId = this.terms.getTermId(predicate);
    const objectId = this.terms.getTermId(object);

    this.removeParts(graphId, 'subjects', subjectId);
    this.removeParts(graphId, 'predicates', predicateId);
    this.removeParts(graphId, 'objects', objectId);

    this.terms.deleteTerm(subject);
    this.terms.deleteTerm(predicate);
    this.terms.deleteTerm(object);

    this.cachedSize = null;
  }

  has({ subject, predicate, object, graph }: Quad): boolean {
    const graphId = this.terms.getTermId(graph);
    const subjectId = this.terms.getTermId(subject);
    const predicateId = this.terms.getTermId(predicate);
    const objectId = this.terms.getTermId(object);

    return (
      this.graphs
        .get(graphId)
        ?.subjects?.get(subjectId)
        ?.get(predicateId)
        ?.has(objectId) || false
    );
  }

  match(
    subject?: Term,
    predicate?: Term,
    object?: Term,
    graph?: Term
  ): QuadIndex {
    const gId = graph && this.terms.getTermId(graph);
    const sId = subject && this.terms.getTermId(subject);
    const pId = predicate && this.terms.getTermId(predicate);
    const oId = object && this.terms.getTermId(object);

    if (this.isValidId(gId) && !this.graphs.has(gId)) {
      return new QuadIndex();
    }

    const graphs = this.isValidId(gId) ? [this.graphs.get(gId)] : this.graphs;

    const matchSubject = this.isValidId(sId);
    const matchPredicate = this.isValidId(pId);
    const matchObject = this.isValidId(oId);

    let terms: number[][];

    graphs.forEach((curr: Graph) => {
      switch (true) {
        case matchSubject && !matchPredicate && !matchObject:
          terms = curr.subjects.match(sId);
          break;
        case matchSubject && matchPredicate && !matchObject:
          terms = curr.subjects.match(sId, pId);
          break;
        case matchSubject && matchPredicate && matchObject:
          terms = curr.subjects.match(sId, pId, oId);
          break;
        case matchPredicate && !matchSubject && !matchObject:
          terms = curr.predicates.match(pId);
          break;
        case matchPredicate && matchObject && !matchSubject:
          terms = curr.predicates.match(pId, oId);
          break;
        case matchObject && !matchSubject && !matchPredicate:
          terms = curr.objects.match(oId);
          break;
        case matchObject && matchSubject && !matchPredicate:
          terms = curr.objects.match(oId, sId);
          break;
        case !matchSubject && !matchPredicate && !matchObject:
          terms = [];
          break;
        default:
          throw new Error('Unable to attempt matching given parameters');
      }
    });

    const termIndex = this.terms.fromIds(
      Array.from(new Set(terms.reduce((acc, curr) => acc.concat(curr), [])))
    );

    const graphIndex = new GraphIndex();
    terms.forEach(([graphId, subjectId, predicateId, objectId]) => {
      graphIndex.addTerm(graphId, subjectId, predicateId, objectId);
    });

    return new QuadIndex(termIndex, graphIndex);
  }

  private isValidId(id: number): boolean {
    return typeof id === 'number';
  }

  private removeParts = (
    graphId: number,
    partKey: PartKey,
    primaryId: number
  ): void => {
    const graph = this.graphs.get(graphId);

    if (!graph) {
      return;
    }

    const partIndex = graph[partKey];

    partIndex.delete(primaryId);

    if (partIndex.size === 0) {
      this.graphs.delete(graphId);
    }
  };

  *[Symbol.iterator](): Iterator<Quad> {
    const acc: number[][] = [];

    this.graphs.forEach((graph: Graph, gId: number) => {
      graph.subjects.forEach((predicates: SecondPartIndex, sId: number) => {
        predicates.forEach((objects: ThirdPartIndex, pId: number) => {
          objects.forEach((oId: number) => {
            acc.push([sId, pId, oId, gId]);
          });
        });
      });
    });

    for (let i = 0; i < acc.length; i++) {
      const [sId, pId, oId, gId] = acc[i];
      yield new Quad(
        this.terms.getTerm(sId),
        this.terms.getTerm(pId),
        this.terms.getTerm(oId),
        this.terms.getTerm(gId)
      );
    }
  }
}
