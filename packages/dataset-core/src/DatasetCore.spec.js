const DatasetCore = require('.').default;
const DataFactory = require('@yardfjs/data-factory').default;

let ds, df;

const INITIAL_GRAPH_COUNT = 3;
const INITIAL_SUBJECT_COUNT = 3;
const INITIAL_PREDICATE_COUNT = 3;
const INITIAL_OBJECT_COUNT = 10;
const EXAMPLE_NAMESPACE = 'http://example.org/';

// generate a non-empty DatasetCore
beforeEach(() => {
  ds = new DatasetCore();
  df = new DataFactory();

  for (let i = 0; i < INITIAL_GRAPH_COUNT; i++) {
    const graph =
      i === 0
        ? df.defaultGraph()
        : df.namedNode(`${EXAMPLE_NAMESPACE}graph${i}`);
    for (let j = 0; j < INITIAL_SUBJECT_COUNT; j++) {
      const subject = df.namedNode(`${EXAMPLE_NAMESPACE}subject${j}`);
      for (let k = 0; k < INITIAL_PREDICATE_COUNT; k++) {
        const predicate = df.namedNode(`${EXAMPLE_NAMESPACE}predicate${k}`);
        for (let l = 0; l < INITIAL_OBJECT_COUNT; l++) {
          let object;
          switch (true) {
            case k % 2 === 0:
              object = df.namedNode(`${EXAMPLE_NAMESPACE}object${l}`);
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
    // when the quad is added to the dataset
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
    // when the quad is added to the dataset
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
    // when the quad is added to the dataset
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
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, null, null, df.namedNode('graph')).has(q)).toBe(true);
  });

  it('should match by subject and predicate', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subjectandpredicate')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(q.subject, q.predicate).has(q)).toBe(true);
  });

  it('should match by subject and object', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subjectandobject')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(q.subject, null, q.object).has(q)).toBe(true);
  });

  it('should match by subject and graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subjectandgraph')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(q.subject, null, null, q.graph).has(q)).toBe(true);
  });

  it('should match by predicate and object', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('predicateandobject')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, q.predicate, q.object).has(q)).toBe(true);
  });

  it('should match by predicate and graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('predicateandgraph')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, q.predicate, null, q.graph).has(q)).toBe(true);
  });

  it('should match by object and graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('objectandgraph')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, null, q.object, q.graph).has(q)).toBe(true);
  });

  it('should match by subject, predicate and object', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subjectpredicateandobject')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(q.subject, q.predicate, q.object).has(q)).toBe(true);
  });

  it('should match by subject, predicate and graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subjectpredicateandgraph')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(q.subject, q.predicate, null, q.graph).has(q)).toBe(true);
  });

  it('should match by subject, object and graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subjectobjectandgraph')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(q.subject, null, q.object, q.graph).has(q)).toBe(true);
  });

  it('should match by predicate, object and graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('predicateobjectandgraph')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(null, q.predicate, q.object, q.graph).has(q)).toBe(true);
  });

  it('should match by subject, predicate, object and graph', () => {
    // given a quad
    const q = df.quad(
      df.namedNode('match'),
      df.namedNode('by'),
      df.namedNode('subjectpredicateobjectandgraph')
    );
    // when the quad is added to the dataset
    ds.add(q);
    // then the match method should return a DatasetCore with that quad
    expect(ds.match(q.subject, q.predicate, q.object, q.graph).has(q)).toBe(
      true
    );
  });

  it('should return a dataset with the expected size', () => {
    // given a dataset
    // when matching against a known term
    const matchDs = ds.match(
      df.namedNode(`${EXAMPLE_NAMESPACE}subject${INITIAL_SUBJECT_COUNT - 1}`)
    );
    // then the dataset should have the expected size (one matching subject per graph, in this case)
    expect(matchDs.size).toBe(
      INITIAL_GRAPH_COUNT * INITIAL_PREDICATE_COUNT * INITIAL_OBJECT_COUNT
    );
  });

  // still TODO: will treat terms that can't be found as wildcards :(
});
