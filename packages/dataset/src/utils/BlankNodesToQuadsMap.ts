import { Quad } from '@yardfjs/data-factory';
import { isBlankNode } from './termType';
import serializeTerm from './serializeTerm';

export default class BlankNodesToQuadsMap extends Map<string, Quad[]> {
  /**
   * Conditionally adds a quad to the map. A blank node should not appear as a predicate:
   * https://rdf.js.org/data-model-spec/#quad-interface
   */
  add(quad: Quad): void {
    const { subject, object, graph } = quad;

    [subject, object, graph].filter(isBlankNode).forEach((bNode) => {
      const id = serializeTerm(bNode);

      if (!this.has(id)) {
        this.set(id, [quad]);
        return;
      }

      const quads = this.get(id);

      if (quads.some((other) => other.equals(quad))) {
        return;
      }

      quads.push(quad);
    });
  }
}
