const DefaultGraph = require('./DefaultGraph').default;
const NamedNode = require('./NamedNode').default;
const Quad = require('./Quad').default;

describe('equals', () => {
  it('should return true for equal quads', () => {
    const quad = new Quad(
      new NamedNode('http://example.org/subject'),
      new NamedNode('http://example.org/predicate'),
      new NamedNode('http://example.org/object'),
      new DefaultGraph()
    );
    expect(quad.equals(quad)).toBe(true);
  });
});
