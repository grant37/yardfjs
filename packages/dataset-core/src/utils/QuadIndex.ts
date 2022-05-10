import { Quad, Term } from '@yardfjs/data-factory';
import Graph from './Graph';
import GraphIndex from './GraphIndex';

import TermIndex from './TermIndex';

type PartKey = 'subjects' | 'predicates' | 'objects';
type PartIndex = Map<number, SecondPartIndex>;
type SecondPartIndex = Map<number, ThirdPartIndex>;
type ThirdPartIndex = Set<number>;

/**
 * Internal representation of quads. Various indices are of the following form:
 * g -> subjects -> s -> p -> o
 * g -> predicates p -> o -> s
 * g -> objects -> o -> s -> p
 */
export default class QuadIndex {
  private terms: TermIndex;

  private graphs: GraphIndex;

  private static createGraph = (): Graph => new Graph();

  constructor(terms?: TermIndex, graphs?: GraphIndex) {
    if ((terms && !graphs) || (!terms && graphs)) {
      throw new Error('Must provide both terms and graphs or neither');
    }

    this.terms = terms || new TermIndex();
    this.graphs = graphs || new Map();
  }

  get size() {
    return Array.from(this.graphs.values()).reduce(
      (acc: number, graph: Graph) => {
        const predicates = graph.subjects.values();
        const objects: ThirdPartIndex[] = Array.prototype.map.call(
          predicates,
          (index: SecondPartIndex) => index.values()
        );

        return (
          acc +
          objects.reduce(
            (curr: number, set: ThirdPartIndex) => curr + set.size,
            0
          )
        );
      },
      0
    );
  }

  add({ subject, predicate, object, graph }: Quad): void {
    const graphId = this.terms.addTerm(graph);
    const subjectId = this.terms.addTerm(subject);
    const predicateId = this.terms.addTerm(predicate);
    const objectId = this.terms.addTerm(object);

    this.indexParts(graphId, 'subjects', subjectId, predicateId, objectId);
    this.indexParts(graphId, 'predicates', predicateId, objectId, subjectId);
    this.indexParts(graphId, 'objects', objectId, subjectId, predicateId);
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

    const graphs = this.isValidId(gId) ? new Map([[gId, gId]]) : this.graphs;

    const matchSubject = this.isValidId(sId);
    const matchPredicate = this.isValidId(pId);
    const matchObject = this.isValidId(oId);

    let terms: number[][];

    graphs.forEach((_: Graph | number, currGraphId: number) => {
      switch (true) {
        case matchSubject && !matchPredicate && !matchObject:
          terms = this.dynamicMatch(sId, currGraphId, 'subjects');
          break;
        case matchSubject && matchPredicate && !matchObject:
          terms = this.dynamicMatch(sId, currGraphId, 'subjects', pId);
          break;
        case matchSubject && matchPredicate && matchObject:
          terms = this.dynamicMatch(sId, currGraphId, 'subjects', pId, oId);
          break;
        case matchPredicate && !matchSubject && !matchObject:
          terms = this.dynamicMatch(pId, currGraphId, 'predicates');
          break;
        case matchPredicate && matchObject && !matchSubject:
          terms = this.dynamicMatch(pId, currGraphId, 'predicates', oId);
          break;
        case matchObject && !matchSubject && !matchPredicate:
          terms = this.dynamicMatch(oId, currGraphId, 'objects');
          break;
        case matchObject && matchSubject && !matchPredicate:
          terms = this.dynamicMatch(oId, currGraphId, 'objects', sId);
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

    const graphIndex = terms.reduce((acc, [s, p, o, g]) => {
      this.indexParts.call(acc, g, 'subjects', s, p, o);
      this.indexParts.call(acc, g, 'predicates', p, o, s);
      this.indexParts.call(acc, g, 'objects', o, s, p);
      return acc;
    }, new Map());

    return new QuadIndex(termIndex, graphIndex);
  }

  private isValidId(id: number): boolean {
    return typeof id === 'number';
  }

  private indexParts = (
    graphId: number,
    partKey: PartKey,
    ...parts: number[]
  ): void => {
    const graph = this.graphs.get(graphId) || QuadIndex.createGraph();
    const partIndex = graph.get(partKey);

    const [firstID, id2, thirdID] = parts;
    switch (true) {
      case !partIndex.has(firstID):
        partIndex.set(firstID, new Map([[id2, new Set([thirdID])]]));
        break;
      case !partIndex.get(firstID).has(id2):
        partIndex.get(firstID).set(id2, new Set([thirdID]));
        break;
      default:
        partIndex.get(firstID).get(id2).add(thirdID);
    }
  };

  private removeParts = (
    graphId: number,
    partKey: PartKey,
    primaryId: number
  ): void => {
    const graph = this.graphs.get(graphId) || QuadIndex.createGraph();
    const partIndex = graph.get(partKey);

    partIndex.delete(primaryId);

    if (partIndex.size === 0) {
      this.graphs.delete(graphId);
    }
  };

  /**
   * Return an array of quads as ids where target part id matches for a given graph.
   */
  private dynamicMatch(
    id1: number,
    graphId: number,
    partKey: PartKey,
    id2?: number,
    id3?: number
  ): number[][] {
    const termsToMatch = arguments.length - 2;

    let target: PartIndex | SecondPartIndex = this.graphs
      .get(graphId)
      .get(partKey);

    if (!target.has(id1)) {
      return [];
    }

    target = target.get(id1);

    if (this.isValidId(id2) && !target.has(id2)) {
      return [];
    }

    if (this.isValidId(id3) && !target.get(id2).has(id3)) {
      return [];
    }

    if (termsToMatch === 3) {
      return [this.buildTermIdArray(partKey, id1, id2, id3, graphId)];
    }

    const result = [];

    if (termsToMatch === 2) {
      this.gatherTerms(result, id1, graphId, partKey, target);
      return result;
    }

    target.forEach(
      (_: ThirdPartIndex, __: number, secondIndex: SecondPartIndex) => {
        this.gatherTerms(result, id1, graphId, partKey, secondIndex);
      }
    );

    return result;
  }

  private gatherTerms(
    acc: number[][],
    id1: number,
    graphId: number,
    partKey: PartKey,
    target: SecondPartIndex
  ) {
    target.forEach((thirdIndex: ThirdPartIndex, id2: number) => {
      thirdIndex.forEach((id3: number) => {
        const term = this.buildTermIdArray(partKey, id1, id2, id3, graphId);
        acc.push(term);
      });
    });
  }

  private buildTermIdArray(
    partKey: PartKey,
    id1: number,
    id2: number,
    id3: number,
    graphId: number
  ): number[] {
    switch (partKey) {
      case 'subjects':
        // s -> p -> o
        return [id1, id2, id3, graphId];
      case 'predicates':
        // p -> o -> s
        return [id3, id1, id2, graphId];
      case 'objects':
        // o -> s -> p
        return [id2, id3, id1, graphId];
      default:
        throw new TypeError(`Invalid argument partKey was: ${partKey}`);
    }
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
}
