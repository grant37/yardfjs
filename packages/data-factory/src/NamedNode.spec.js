const NamedNode = require('./NamedNode').default;

describe('NamedNode', () => {
  it('should make an instance with term type NamedNode', () => {
    const node = new NamedNode('hello');

    expect(node.termType).toBe('NamedNode');
  });

  it('should make an instance where value is the provided IRI', () => {
    const node = new NamedNode('http://example.org/resource');

    expect(node.value).toBe('http://example.org/resource');
  });

  it('should make instances that correctly evaluate equality between named nodes', () => {
    const node1 = new NamedNode('http://example.org/resource');
    const node2 = new NamedNode('http://example.org/resource');
    const node3 = new NamedNode('http://example.org/different-resource');

    expect(node1.equals(node2)).toBe(true);
    expect(node2.equals(node3)).toBe(false);
  });

  it('should make instances that correctly evaluate equality between named nodes and other terms', () => {
    const node1 = new NamedNode('http://example.org/resource');
    const blankNode = {
      value: 'b1',
      termType: 'BlankNode',
      equals: (other) => {
        return other.termType === 'BlankNode' && other.value === 'b1';
      },
    };

    expect(node1.equals(blankNode)).toBe(false);
  });
});
