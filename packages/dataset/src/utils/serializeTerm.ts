import { Literal, Term } from '@yardfjs/data-factory';

/**
 * Serialize a term for an n-quads string.
 * https://www.w3.org/TR/n-quads/
 */
const serializeTerm = (term: Term, blankNodePrefix: string = '_:'): string => {
  switch (term.termType) {
    case 'NamedNode':
      return `<${term.value}>`;
    case 'BlankNode':
      return `${blankNodePrefix}${term.value}`;
    case 'Variable':
      return `?${term.value}`;
    case 'DefaultGraph':
      return '';
    case 'Literal': {
      const literal = term as Literal;
      switch (true) {
        case !!literal.language:
          return `"${literal.value}"@${literal.language}`;
        case !!literal.dataType:
          return `"${literal.value}"^^${serializeTerm(literal.dataType)}`;
        default:
          return `"${literal.value}"`;
      }
    }
    default:
      throw new TypeError(
        `Unsupported term type "${term.termType}" provided to serializeTerm`
      );
  }
};

export default serializeTerm;
