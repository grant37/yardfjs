const DatasetCoreFactory = require('.').default;
const { DatasetCore, DataFactory } = require('.');

describe('dataset', () => {
  it('should be a static member of the factory class', () => {
    expect(DatasetCoreFactory.dataset).toBeInstanceOf(Function);
  });

  it('should generate an empty dataset when no args are provided', () => {
    const dataset = DatasetCoreFactory.dataset();
    expect(dataset).toBeInstanceOf(DatasetCore);
    expect(dataset.size).toBe(0);
  });

  it('should generate a dataset with the provided data', () => {
    const df = new DataFactory();
    const data = [];
    for (let i = 0; i < 10; i++) {
      data.push(
        df.quad(
          df.namedNode(`s${i}`),
          df.namedNode(`p${i}`),
          df.literal(`o${i}`)
        )
      );
    }
    const dataset = DatasetCoreFactory.dataset(data);
    expect(dataset).toBeInstanceOf(DatasetCore);
    data.forEach((q) => expect(dataset.has(q)).toBe(true));
  });
});
