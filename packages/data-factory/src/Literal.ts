import NamedNode from './NamedNode';
import Term from './Term';

export default class Literal extends Term {
  get termType(): string {
    return 'Literal';
  }

  private static readonly DEFAULT_DATATYPE: NamedNode = new NamedNode(
    'http://www.w3.org/2001/XMLSchema#string'
  );

  private static readonly DEFAULT_LANGSTRING_DATATYPE = new NamedNode(
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'
  );

  private lang: string = '';

  private type: NamedNode = Literal.DEFAULT_DATATYPE;

  constructor(value: string, languageOrDatatype?: string | NamedNode) {
    super(value);
    if (typeof languageOrDatatype === 'string') {
      this.language = languageOrDatatype;
      this.dataType = Literal.DEFAULT_LANGSTRING_DATATYPE;
    } else if (languageOrDatatype?.termType === 'NamedNode') {
      this.dataType = languageOrDatatype;
    }
  }

  get dataType(): NamedNode {
    return this.type;
  }

  set dataType(datatype: NamedNode) {
    this.type = datatype;
  }

  get language(): string {
    return this.lang;
  }

  set language(lang: string) {
    this.lang = lang;
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
