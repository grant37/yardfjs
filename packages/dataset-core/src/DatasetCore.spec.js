const DatasetCore = require('.').default;
const DataFactory = require('@yardfjs/data-factory').default;

let ds, df;

// generate a non-empty DatasetCore
beforeEach(() => {
  ds = new DatasetCore();
  df = new DataFactory();

  for (let i = 0; i < 5; i++) {
    const graph =
      i === 0
        ? df.defaultGraph()
        : df.namedNode(`http://example.org/graph${i}`);
    for (let j = 0; j < 5; j++) {
      const subject = df.namedNode(`http://example.org/subject${i}`);
      for (let k = 0; k < 5; k++) {
        const predicate = df.namedNode(`http://example.org/predicate${i}`);
        for (let l = 0; l < 10; l++) {
          let object;
          switch (true) {
            case k % 2 === 0:
              object = df.namedNode(`http://example.org/object${i}`);
              break;
            case k % 3 === 0:
              object = df.blankNode(`b${i}${j}${k}${l}`);
              break;
            default:
              object = df.literal(`${i}${j}${k}${l}`);
          }
          ds.add(df.quad(subject, predicate, object, graph));
        }
      }
    }
  }
});

describe('has', () => {
  it('should return false for a non-existing quad', () => {
    // given a DatasetCore
    // when a non-existing quad is checked
    const q = df.quad(
      df.namedNode('defintely'),
      df.namedNode('not'),
      df.namedNode('here')
    );
    // then the has method should return false
    expect(ds.has(q)).toBe(false);
  });

  // same test as in add, but whatever
  it('should return true for an existing quad', () => {
    // given a DatasetCore
    // when a quad is added
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('object')
    );
    ds.add(q);
    // then the has method should return true for that quad
    expect(ds.has(q)).toBe(true);
  });
});

describe('add', () => {
  it('should increment size for each added quad', () => {
    // given a DatasetCore
    const startingSize = ds.size;
    // when a unique quad is added in any graph
    ds.add(
      df.quad(
        df.namedNode('person/1'),
        df.namedNode('owns'),
        df.namedNode('computer/1')
      )
    );
    // then the size should be increased by one
    expect(ds.size).toBe(startingSize + 1);
  });

  it('should report storing added quad', () => {
    // given a quad
    const quad = df.quad(
      df.namedNode('test'),
      df.namedNode('add'),
      df.namedNode('quad')
    );
    // when the quad is added in any graph
    ds.add(quad);
    // it should be possible to find that quad
    expect(ds.has(quad)).toBe(true);
  });
});

describe('match', () => {
  it('should return a new DatasetCore', () => {
    // given a DatasetCore
    // when the match method is called
    const matchDs = ds.match();
    // then the result should be a new DatasetCore
    expect(matchDs instanceof DatasetCore).toBe(true);
    expect(matchDs).not.toBe(ds);
  });

  it('should match by subject', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subject')
    );
    // when the quad is added to a DatasetCore
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    const matchDs = ds.match(q.subject);
    expect(matchDs.has(q)).toBe(true);
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
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, q.predicate).has(q)).toBe(true);
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
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, null, df.namedNode('object')).has(q)).toBe(true);
  });

  it('should match by graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('the'),
      df.namedNode('graph')
    );
    // when a quad is added
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, null, null, df.namedNode('graph')).has(q)).toBe(true);
  });
});
