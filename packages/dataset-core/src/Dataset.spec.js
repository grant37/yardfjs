const Dataset = require('.').default;
const DataFactory = require('@yardfjs/data-factory').default;

let ds, df;
const COUNT = 100;

beforeAll(() => {
  ds = new Dataset();
  df = new DataFactory();

  for (let i = 0; i < COUNT; i++) {
    ds.add(
      df.quad(
        df.namedNode(`s${i}`),
        df.namedNode(`p${i}`),
        df.namedNode(`o${i}`)
      )
    );
  }

  for (let i = 0; i < COUNT; i++) {
    ds.add(
      df.quad(
        df.namedNode(`s${i}`),
        df.namedNode(`p${i}`),
        df.namedNode(`o${i}`),
        df.namedNode(`g${i}`)
      )
    );
  }
});

describe('add', () => {
  it('should increment size for each added quad', () => {
    // given a dataset
    expect(ds.size).toBe(200);
    // when a unique quad is added in any graph
    ds.add(
      df.quad(
        df.namedNode('person/1'),
        df.namedNode('owns'),
        df.namedNode('computer/1')
      )
    );
    // then the size should be increased by one
    expect(ds.size).toBe(201);
  });

  it('should be able to find a quad that has been added in any graph', () => {
    // given a dataset
    // when a unique quad is added in any graph
    const quad = df.quad(
      df.namedNode('s0'),
      df.namedNode('p0'),
      df.namedNode('o0')
    );
    // it should be possible to find that quad
    expect(ds.has(quad)).toBe(true);
  });
});

describe('match', () => {
  it('should return a new dataset', () => {
    // given a dataset
    // when the match method is called
    const matchDs = ds.match();
    // then the result should be a new dataset
    expect(matchDs instanceof Dataset).toBe(true);
    expect(matchDs).not.toBe(ds);
  });

  it('should match by subject', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subject')
    );
    // when the quad is added to a dataset
    ds.add(q);
    // then the match method should return a dataset with that quad
    expect(ds.match(df.namedNode('match')).has(q)).toBe(true);
  });

  it('should match by predicate', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('predicate')
    );
    // when a quad is added
    ds.add(q);
    // then the match method should return a dataset with that quad
    expect(ds.match(null, df.namedNode('predicate')).has(q)).toBe(true);
  });

  it('should match by object', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('object')
    );
    // when a quad is added
    ds.add(q);
    // then the match method should return a dataset with that quad
    expect(ds.match(null, null, df.namedNode('object')).has(q)).toBe(true);
  });
});
