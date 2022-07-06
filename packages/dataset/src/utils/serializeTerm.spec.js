const serializeTerm = require('./serializeTerm').default;
describe('serializeTerm', () => {
  it('should serialize an IRI', () => {
    const term = {
      termType: 'NamedNode',
      value: 'http://example.org/foo',
    };
    expect(serializeTerm(term)).toBe('<http://example.org/foo>');
  });

  it('should serialize a blank node', () => {
    const term = {
      termType: 'BlankNode',
      value: 'foo',
    };
    expect(serializeTerm(term)).toBe('_:foo');
  });

  it('should serialize a blank node with a custom prefix', () => {
    const term = {
      termType: 'BlankNode',
      value: 'foo',
    };
    expect(serializeTerm(term, '_zzz:')).toBe('_zzz:foo');
  });

  it('should serialize the default graph', () => {
    const term = {
      termType: 'DefaultGraph',
      value: '',
    };
    expect(serializeTerm(term)).toBe('');
  });

  it('should serialize a literal', () => {
    const term = {
      termType: 'Literal',
      value: 'foo',
      language: 'en',
    };
    expect(serializeTerm(term)).toBe('"foo"@en');
  });

  it('should serialize a literal with a data type', () => {
    const term = {
      termType: 'Literal',
      value: 'foo',
      dataType: {
        termType: 'NamedNode',
        value: 'http://example.org/foo',
      },
    };
    expect(serializeTerm(term)).toBe('"foo"^^<http://example.org/foo>');
  });

  it('should serialize a literal with a lang tag', () => {
    const term = {
      termType: 'Literal',
      value: 'foo',
      language: 'en',
    };
    expect(serializeTerm(term)).toBe('"foo"@en');
  });

  it('should serialize an unadorned literal', () => {
    const term = {
      termType: 'Literal',
      value: 'foo',
    };
    expect(serializeTerm(term)).toBe('"foo"');
  });
});
