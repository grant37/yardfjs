import { FirstIndex, Graph } from '../types';
import { Literal, Term } from '@yardfjs/data-factory';

export const initGraph = (): Graph =>
  new Map([
    ['subjects', new Map()],
    ['predicates', new Map()],
    ['objects', new Map()],
  ]);

const indexParts = (index: FirstIndex, ...parts: number[]): void => {
  const [firstID, secondID, thirdID] = parts;
  switch (true) {
    case !index.has(firstID):
      index.set(firstID, new Map([[secondID, new Set([thirdID])]]));
      break;
    case !index.get(firstID).has(secondID):
      index.get(firstID).set(secondID, new Set([thirdID]));
      break;
    default:
      index.get(firstID).get(secondID).add(thirdID);
  }
};

export const indexQuad = (
  graph: Graph,
  s: number,
  p: number,
  o: number
): void => {
  indexParts(graph.get('subjects'), s, p, o);
  indexParts(graph.get('predicates'), p, o, s);
  indexParts(graph.get('objects'), o, s, p);
};
