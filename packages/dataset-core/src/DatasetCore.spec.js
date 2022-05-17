const { DatasetCore } = require('.');
const DataFactory = require('@yardfjs/data-factory').default;

let ds, df;

const INITIAL_GRAPH_COUNT = 3;
const INITIAL_SUBJECT_COUNT = 3;
const INITIAL_PREDICATE_COUNT = 3;
const INITIAL_OBJECT_COUNT = 10;
const EXAMPLE_NAMESPACE = 'http://example.org/';

const generateQuads = () => {
  const result = [];
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
            case l % 2 === 0:
              object = df.namedNode(`${EXAMPLE_NAMESPACE}object${l}`);
              break;
            case l % 3 === 0:
              object = df.blankNode(`b${i}${j}${k}${l}`);
              break;
            default:
              object = df.literal(`${i}${j}${k}${l}`);
          }
          result.push(df.quad(subject, predicate, object, graph));
        }
      }
    }
  }
  return result;
};

// generate a non-empty DatasetCore
beforeEach(() => {
  ds = new DatasetCore();
  df = new DataFactory();
  generateQuads().forEach((q) => ds.add(q));
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

describe('delete', () => {
  it('should decrement size for each deleted quad', () => {
    // given a DatasetCore
    const startingSize = ds.size;
    // when a unique quad is deleted in any graph
    ds.delete(
      df.quad(
        df.namedNode(`${EXAMPLE_NAMESPACE}subject1`),
        df.namedNode(`${EXAMPLE_NAMESPACE}predicate1`),
        df.namedNode(`${EXAMPLE_NAMESPACE}object2`)
      )
    );
    // then the size should be decreased by one
    expect(ds.size).toBe(startingSize - 1);
  });

  it('should report not storing deleted quad', () => {
    // given a DatasetCore
    // when a unique quad is deleted in any graph
    const q = df.quad(
      df.namedNode(`${EXAMPLE_NAMESPACE}subject1`),
      df.namedNode(`${EXAMPLE_NAMESPACE}predicate1`),
      df.namedNode(`${EXAMPLE_NAMESPACE}object2`)
    );
    ds.delete(q);
    // then the size should be decreased by one
    expect(ds.has(q)).toBe(false);
  });
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

  it('should return a new dataset of the same size if match is called with no args', () => {
    // given a dataset
    // when matching against a known term
    const matchDs = ds.match();
    // then the dataset should be the same as the original dataset
    expect(matchDs.size).toBe(ds.size);
  });

  it('should return a new dataset of the same size if match is called with all wildcards', () => {
    // given a dataset
    // when matching against a known term
    const matchDs = ds.match(null, undefined, null, undefined);
    // then the dataset should be the same as the original dataset
    expect(matchDs.size).toBe(ds.size);
  });

  df = new DataFactory();
  // combination of non-matching arguments for match
  const nonMatchingCases = [
    [df.namedNode('no-match')],
    [null, df.namedNode('no-match')],
    [null, null, df.namedNode('no-match')],
    [null, null, null, df.namedNode('no-match')],
    [df.namedNode('no-match'), df.namedNode(`${EXAMPLE_NAMESPACE}predicate2`)],
    [
      df.namedNode('no-match'),
      null,
      df.namedNode(`${EXAMPLE_NAMESPACE}object2`),
    ],
    [
      df.namedNode('no-match'),
      null,
      null,
      df.namedNode(`${EXAMPLE_NAMESPACE}graph2`),
    ],
    [
      null,
      df.namedNode(`${EXAMPLE_NAMESPACE}predicate2`),
      df.namedNode('no-match'),
    ],
    [
      null,
      df.namedNode(`${EXAMPLE_NAMESPACE}predicate2`),
      null,
      df.namedNode('no-match'),
    ],
  ];

  test.each(nonMatchingCases)(
    'should return an empty dataset when there is no match, args: %p, %p, %p, %p',
    (...args) => {
      // given a dataset
      // when matching against a term known not to be in the dataset
      const matchDs = ds.match(...args);
      // then the result dataset should be empty
      expect(matchDs.size).toBe(0);
    }
  );
});

describe('iterable<Quad>', () => {
  it('should iterate over expected number of quads', () => {
    // given a dataset
    // when iterating over the quads
    let i = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (_ of ds) {
      i++;
    }
    // then the number of quads should be the expected size
    expect(i).toBe(ds.size);
  });

  it('should find eqach quad in iteration in the dataset', () => {
    // given a dataset
    // when iterating over the quads
    // then the number of quads should be the expected size
    // eslint-disable-next-line no-restricted-syntax
    for (const q of ds) {
      expect(ds.has(q)).toBe(true);
    }
  });

  it('should iterate over all quads added', () => {
    // given a dataset
    // when iterating over the quads
    // then each quad should be one we expect
    const quads = generateQuads();
    const seen = new Set();
    // eslint-disable-next-line no-restricted-syntax
    for (const q of ds) {
      const i = quads.findIndex((quad) => quad.equals(q));
      expect(i).not.toBe(-1);
      expect(seen.has(i)).toBe(false);
      seen.add(i);
    }
  });

  it('should be array-like', () => {
    // given a dataset
    // it should behave as an array-like object
    expect(Array.from(ds).length).toEqual(ds.size);
  });
});
