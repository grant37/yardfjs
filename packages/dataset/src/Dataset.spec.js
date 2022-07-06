const Dataset = require('.').default;
const DataFactory = require('@yardfjs/data-factory').default;
const { faker } = require('@faker-js/faker');

const factory = new DataFactory();

const getPersonNode = () =>
  factory.namedNode(`https://example.org/${faker.name.firstName()}`);

const getPerson = () =>
  factory.quad(
    getPersonNode(),
    factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    factory.namedNode('http://xmlns.com/foaf/0.1/Person')
  );

const addPersonRelationship = (dataset) => {
  const p1 = getPerson();
  const p2 = getPerson();
  const r = factory.quad(
    p1.subject,
    factory.namedNode('http://xmlns.com/foaf/0.1/knows'),
    p2.subject
  );

  dataset.add(p1);
  dataset.add(p2);
  dataset.add(r);
};

describe('contains', () => {
  it('should return true for two empty datasets', async () => {
    const dataset = new Dataset();
    const other = new Dataset();
    expect(await dataset.contains(other)).toBe(true);
  });

  describe('without blanknodes', () => {
    let dataset;
    let other;

    beforeAll(() => {
      dataset = new Dataset();
      other = new Dataset();
      for (let i = 0; i < 10; i++) {
        addPersonRelationship(dataset);
      }

      dataset.forEach((quad, i) => {
        if (i % 2 === 0) {
          other.add(quad);
        }
      });
    });

    it('should return true for a dataset with no blanknodes that contains the provided dataset', async () => {
      expect(await dataset.contains(other)).toBe(true);
    });

    it('should return false for a dataset with no blanknodes that does not contain the provided dataset', async () => {
      expect(await other.contains(dataset)).toBe(false);
    });
  });
});
