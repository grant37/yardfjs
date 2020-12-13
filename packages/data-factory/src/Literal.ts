import { LiteralTermType } from './types';
import NamedNode from './NamedNode';
import Term from './Term';

export default class Literal extends Term {
  readonly termType: LiteralTermType = 'Literal';

  language: string = '';

  dataType: NamedNode = new NamedNode(
    'http://www.w3.org/2001/XMLSchema#string'
  );

  constructor(value: string, languageOrDatatype?: string | NamedNode) {
    super(value);
    if (typeof languageOrDatatype === 'string') {
      this.language = languageOrDatatype;
      this.dataType = new NamedNode(
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'
      );
    } else if (languageOrDatatype?.termType === 'NamedNode') {
      this.dataType = languageOrDatatype;
    }
  }

  equals(other?: Literal): boolean {
    return (
      super.equals(other) &&
      other.dataType.equals(this.dataType) &&
      other.language === this.language &&
      other.value === this.value
    );
  }
}
