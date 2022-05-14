import { Quad, Term } from '@yardfjs/data-factory';

import Graph from './Graph';
import GraphIndex from './GraphIndex';
import SecondPartIndex from './SecondPartIndex';
import TermIndex from './TermIndex';
import ThirdPartIndex from './ThirdPartIndex';
import isValidId from './isValidId';

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

    if (!this.graphs.has(graphId)) {
      return;
    }

    const targetGraph = this.graphs.get(graphId);
    targetGraph.deleteTerm(subjectId, predicateId, objectId);

    if (targetGraph.isEmpty()) {
      this.graphs.delete(graphId);
    }

    this.removeTermIfUnused(subjectId);
    this.removeTermIfUnused(predicateId);
    this.removeTermIfUnused(objectId);
    this.removeTermIfUnused(graphId);

    this.cachedSize = null;
  }

  has({ subject, predicate, object, graph }: Quad): boolean {
    const graphId = this.terms.getTermId(graph);
    const subjectId = this.terms.getTermId(subject);
    const predicateId = this.terms.getTermId(predicate);
    const objectId = this.terms.getTermId(object);

    return (
      this.graphs.get(graphId)?.hasTerm(subjectId, predicateId, objectId) ??
      false
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

    const isGraphIdValid = isValidId(gId);

    if (isGraphIdValid && !this.graphs.has(gId)) {
      return new QuadIndex();
    }

    const graphs = isGraphIdValid ? [this.graphs.get(gId)] : this.graphs;

    const matchSubject = isValidId(sId);
    const matchPredicate = isValidId(pId);
    const matchObject = isValidId(oId);

    const terms: number[][] = [];

    graphs.forEach((curr: Graph) => {
      switch (true) {
        case matchSubject && !matchPredicate && !matchObject:
          terms.push(...curr.subjects.match(sId));
          break;
        case matchSubject && matchPredicate && !matchObject:
          terms.push(...curr.subjects.match(sId, pId));
          break;
        case matchSubject && matchPredicate && matchObject:
          terms.push(...curr.subjects.match(sId, pId, oId));
          break;
        case matchPredicate && !matchSubject && !matchObject:
          terms.push(...curr.predicates.match(pId));
          break;
        case matchPredicate && matchObject && !matchSubject:
          terms.push(...curr.predicates.match(pId, oId));
          break;
        case matchObject && !matchSubject && !matchPredicate:
          terms.push(...curr.objects.match(oId));
          break;
        case matchObject && matchSubject && !matchPredicate:
          terms.push(...curr.objects.match(oId, sId));
          break;
        case !matchSubject && !matchPredicate && !matchObject:
          terms.push(...curr.subjects.match());
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

  private removeTermIfUnused(termId: number): void {
    if (this.graphs.has(termId)) {
      return;
    }

    let shouldDelete = false;
    this.graphs.forEach((graph) => {
      if (
        !graph.subjects.has(termId) &&
        !graph.predicates.has(termId) &&
        !graph.objects.has(termId)
      ) {
        shouldDelete = true;
      }
    });

    if (shouldDelete) {
      this.terms.deleteTerm(termId);
    }
  }
}
