const Dataset = require('.').default;
const DataFactory = require('@yardfjs/data-factory').default;

describe('Dataset', () => {
  it('should exist as the default export', () => {
    expect(Dataset).toBeTruthy();
  });

  it('should add quads', () => {
    const ds = new Dataset();
    const df = new DataFactory();

    const q = df.quad(df.namedNode('s'), df.namedNode('p'), df.namedNode('o'));
    ds.add(q);

    expect(ds.size).toBe(1);
    expect(ds.has(q)).toBe(true);
  });
});
