const Dataset = require('.').default;
const { quad, namedNode } = require('@yardfjs/data-factory');

describe('Dataset', () => {
  it('should exist as the default export', () => {
    expect(Dataset).toBeTruthy();
  });

  it('should add quads', () => {
    const ds = new Dataset();
    const q = quad(namedNode('s'), namedNode('p'), namedNode('o'));
    ds.add(q);
    expect(ds.size).toBe(1);
    expect(ds.has(q)).toBe(true);
  });
});
