const DataFactory = require('./DataFactory').default;

describe('DataFactory', () => {
  it('should create named nodes', () => {
    const node = new DataFactory().namedNode('hello');
    expect(node.value).toBe('hello');
    expect(node.termType).toBe('NamedNode');
    expect(node.equals(new DataFactory().namedNode('hello'))).toBe(true);
    expect(node.equals(new DataFactory().namedNode('goodbye'))).toBe(false);
  });

  it('should create blank nodes', () => {
    const node = new DataFactory().blankNode();
    expect(node.value).toBe('b1');
    expect(node.termType).toBe('BlankNode');
    expect(node.equals(new DataFactory().blankNode('b1'))).toBe(true);
    expect(node.equals(new DataFactory().blankNode('b2'))).toBe(false);
  });
});
