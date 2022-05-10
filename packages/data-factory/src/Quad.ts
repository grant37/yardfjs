import BlankNode from './BlankNode';
import DefaultGraph from './DefaultGraph';
import Literal from './Literal';
import NamedNode from './NamedNode';
import Term from './Term';
import Variable from './Variable';

export type Subject = Term & (NamedNode | BlankNode | Variable | Quad);
export type Predicate = Term & (NamedNode | Variable);
export type Object = Term & (NamedNode | BlankNode | Variable | Literal);
export type Graph = Term & (NamedNode | BlankNode | Variable | DefaultGraph);

export default class Quad extends Term {
  get termType(): string {
    return 'Quad';
  }

  constructor(
    readonly subject: Subject,
    readonly predicate: Predicate,
    readonly object: Object,
    readonly graph: Graph
  ) {
    super('');
  }

  equals(other?: Quad): boolean {
    return (
      super.equals(other) &&
      this.subject.equals(other.subject) &&
      this.predicate.equals(other.predicate) &&
      this.object.equals(other.object) &&
      this.graph.equals(other.graph)
    );
  }
}
