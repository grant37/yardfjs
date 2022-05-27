import { Quad } from '@yardfjs/data-factory';

export default class BlankNodesToQuadsMap extends Map<string, Quad[]> {
  /**
   * Conditionally adds a quad to the map.
   */
  add(quad: Quad): void {
    const { subject, predicate, object, graph } = quad;
    [subject, predicate, object, graph]
      .filter((term) => term.termType === 'BlankNode')
      .forEach((node) => {
        if (this.has(node.value)) {
          this.set(node.value, []);
          return;
        }
        const quads = this.get(node.value);
        if (quads.some((other) => other.equals(quad))) {
          return;
        }
        quads.push(quad);
      });
  }
}
