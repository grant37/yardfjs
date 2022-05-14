const Dataset = require('./dataset-core/dist').default;
const DataFactory = require('./data-factory/dist').default;

const ds = new Dataset();
const df = new DataFactory();

for (let i = 0; i < 10; i++) {
  ds.add(
    df.quad(
      df.namedNode(`http://example.org/subject${i}`),
      df.namedNode(`http://example.org/predicate${i}`),
      df.namedNode(`http://example.org/object${i}`),
      df.namedNode(`http://example.org/graph${i}`)
    )
  );
}

for (let i = 0; i < 10; i++) {
  ds.add(
    df.quad(
      df.namedNode(`http://example.org/subject${i}`),
      df.namedNode(`http://example.org/predicate${i}`),
      df.namedNode(`http://example.org/object${i}`),
      df.namedNode(`http://example.org/graph${i}`)
    )
  );
}

console.log(ds.size);

console.log(ds.match(df.namedNode('http://example.org/subject1')).size);

for (quad of ds) {
  console.log(quad);
}
