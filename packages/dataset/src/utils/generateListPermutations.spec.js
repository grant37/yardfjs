const generate = require('./generateListPermutations').default;

describe('generateListPermutations', () => {
  it('should handle a simple case', () => {
    const output = generate(3, ['a', 'b', 'c']);
    expect(output.sort()).toEqual([
      ['a', 'b', 'c'],
      ['a', 'c', 'b'],
      ['b', 'a', 'c'],
      ['b', 'c', 'a'],
      ['c', 'a', 'b'],
      ['c', 'b', 'a'],
    ]);
  });
});
