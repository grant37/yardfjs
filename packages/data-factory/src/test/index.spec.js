const DataFactory = require('../');

describe('DataFactory', () => {
  it('should exist', () => {
    expect(DataFactory).toBeTruthy();
  });

  it('should create named nodes', () => {
    const node = DataFactory.namedNode('hello');
    expect(node.value).toBe('hello');
    expect(node.termType).toBe('NamedNode');
    expect(node.equals(DataFactory.namedNode('hello'))).toBe(true);
    expect(node.equals(DataFactory.namedNode('goodbye'))).toBe(false);
  });

  it('should create blank nodes', () => {
    const node = DataFactory.blankNode();
    expect(node.value).toBe('b1');
    expect(node.termType).toBe('BlankNode');
    expect(node.equals(DataFactory.blankNode('b1'))).toBe(true);
    expect(node.equals(DataFactory.blankNode())).toBe(false);
  });
});
