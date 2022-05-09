import { Quad, Term } from '@yardfjs/data-factory';

import TermIndex from './TermIndex';

type PartKey = 'subjects' | 'predicates' | 'objects';
type PartIndex = Map<number, SecondPartIndex>;
type SecondPartIndex = Map<number, Set<number>>;
type Graph = Map<PartKey, PartIndex>;

type GraphIndex = Map<number, Graph>;

/**
 * Internal representation of quads. Various indices are of the following form:
 * g -> subjects -> s -> p -> o
 * g -> predicates p -> o -> s
 * g -> objects -> o -> s -> p
 */
export default class QuadIndex {
  private terms: TermIndex;

  private graphs: GraphIndex;

  private static createGraph = (): Graph =>
    new Map([
      ['subjects', new Map()],
      ['predicates', new Map()],
      ['objects', new Map()],
    ]);

  constructor(terms?: TermIndex, graphs?: GraphIndex) {
    if ((terms && !graphs) || (!terms && graphs)) {
      throw new Error('Must provide both terms and graphs or neither');
    }

    this.terms = terms || new TermIndex();
    this.graphs = graphs || new Map();
  }

  get size() {
    return Array.prototype.reduce.call(
      this.graphs.values(),
      (acc: number, graph: Graph) => {
        const maps = graph.get('subjects').values();

        const objects = Array.prototype.map.call(
          maps,
          Map.prototype.values.call
        );

        return (
          acc +
          objects.reduce((curr: number, set: Set<number>) => curr + set.size, 0)
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

  remove({ subject, predicate, object, graph }: Quad): void {
    const graphId = this.terms.getTermId(graph);
    const subjectId = this.terms.getTermId(subject);
    const predicateId = this.terms.getTermId(predicate);
    const objectId = this.terms.getTermId(object);

    this.removeParts(graphId, 'subjects', subjectId);
    this.removeParts(graphId, 'predicates', predicateId);
    this.removeParts(graphId, 'objects', objectId);
  }

  has({ subject, predicate, object, graph }: Quad): boolean {
    const graphId = this.terms.getTermId(graph);
    const subjectId = this.terms.getTermId(subject);
    const predicateId = this.terms.getTermId(predicate);
    const objectId = this.terms.getTermId(object);

    return this.graphs
      .get(graphId)
      .get('subjects')
      .get(subjectId)
      .get(predicateId)
      .has(objectId);
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

    const graphs = this.isValidId(gId) ? [gId] : this.graphs.keys();

    const matchSubject = this.isValidId(sId);
    const matchPredicate = this.isValidId(pId);
    const matchObject = this.isValidId(oId);

    let terms: number[][];

    Array.prototype.forEach.call(graphs, (currGraphId: number) => {
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
        default:
          throw new Error('Unable to attempt matching given parameters');
      }
    });

    const termIndex = this.terms.fromIds(
      Array.from(new Set(terms.reduce((acc, curr) => acc.concat(curr), [])))
    );

    // TODO generate graphs
    return new QuadIndex(termIndex, new Map());
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

    const [firstID, secondID, thirdID] = parts;
    switch (true) {
      case !partIndex.has(firstID):
        partIndex.set(firstID, new Map([[secondID, new Set([thirdID])]]));
        break;
      case !partIndex.get(firstID).has(secondID):
        partIndex.get(firstID).set(secondID, new Set([thirdID]));
        break;
      default:
        partIndex.get(firstID).get(secondID).add(thirdID);
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
    firstTermId: number,
    graphId: number,
    partKey: PartKey,
    secondTermId?: number,
    thirdTermId?: number
  ): number[][] {
    const termsToMatch = arguments.length - 2;

    let target: PartIndex | SecondPartIndex = this.graphs
      .get(graphId)
      .get(partKey);

    if (!target.has(firstTermId)) {
      return [];
    }

    target = target.get(firstTermId);

    if (this.isValidId(secondTermId) && !target.has(secondTermId)) {
      return [];
    }

    if (
      this.isValidId(thirdTermId) &&
      !target.get(secondTermId).has(thirdTermId)
    ) {
      return [];
    }

    if (termsToMatch === 3) {
      return [
        this.buildTermIdArray(
          partKey,
          firstTermId,
          secondTermId,
          thirdTermId,
          graphId
        ),
      ];
    }

    const result = [];

    if (termsToMatch === 2) {
      this.gatherTerms(result, firstTermId, graphId, partKey, target);
      return result;
    }

    Array.prototype.forEach.call(target, (secondIndex: SecondPartIndex) => {
      this.gatherTerms(result, firstTermId, graphId, partKey, secondIndex);
    });

    return result;
  }

  private gatherTerms(
    acc: number[][],
    firstTermId: number,
    graphId: number,
    partKey: PartKey,
    target: SecondPartIndex
  ) {
    Array.prototype.forEach.call(
      target.entries(),
      ([secondId, thirdIndex]: [number, Set<number>]) => {
        Array.prototype.forEach.call(thirdIndex.values(), (thirdId: number) => {
          const term = this.buildTermIdArray(
            partKey,
            firstTermId,
            secondId,
            thirdId,
            graphId
          );
          acc.push(term);
        });
      }
    );
  }

  private buildTermIdArray(
    partKey: PartKey,
    firstTermId: number,
    secondTermId: number,
    thirdTermId: number,
    graphId: number
  ): number[] {
    switch (partKey) {
      case 'subjects':
        // s -> p -> o
        return [firstTermId, secondTermId, thirdTermId, graphId];
      case 'predicates':
        // p -> o -> s
        return [thirdTermId, firstTermId, secondTermId, graphId];
      case 'objects':
        // o -> s -> p
        return [secondTermId, thirdTermId, firstTermId, graphId];
      default:
        throw new TypeError(`Invalid argument partKey was: ${partKey}`);
    }
  }
}
