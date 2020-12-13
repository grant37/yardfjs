import Quad, { Graph, Object, Predicate, Subject } from './Quad';
import BlankNode from './BlankNode';
import DefaultGraph from './DefaultGraph';
import Literal from './Literal';
import NamedNode from './NamedNode';
import Term from './Term';
import Variable from './Variable';

let blankNodeID: number = 0;

export default class DataFactory {
  static namedNode(value: string): NamedNode {
    return new NamedNode(value);
  }

  static blankNode(value?: string): BlankNode {
    return new BlankNode(value || `b${(++blankNodeID).toString()}`);
  }

  static literal(value?: string, languageOrDatatype?: string | NamedNode) {
    return new Literal(value, languageOrDatatype);
  }

  static variable(value: string): Variable {
    return new Variable(value);
  }

  static defaultGraph(): DefaultGraph {
    return new DefaultGraph();
  }

  static quad(
    subject: Subject,
    predicate: Predicate,
    object: Object,
    graph?: Graph
  ): Quad {
    return new Quad(subject, predicate, object, graph || new DefaultGraph());
  }

  static fromTerm(
    original: NamedNode | BlankNode | Variable | DefaultGraph | Literal | Quad
  ): Term {
    switch (original.termType) {
      case 'NamedNode':
        return DataFactory.namedNode(original.value);
      case 'BlankNode':
        return DataFactory.blankNode(original.value);
      case 'Variable':
        return DataFactory.variable(original.value);
      case 'DefaultGraph':
        return DataFactory.defaultGraph();
      case 'Literal':
        return DataFactory.literal(
          original.value,
          original.language || original.dataType
        );
      case 'Quad':
        return DataFactory.fromQuad(original);
      default:
        throw new TypeError(
          'Unknown term type provided to DataFactory::fromTerm'
        );
    }
  }

  static fromQuad(original: Quad): Quad {
    return DataFactory.quad(
      original.subject,
      original.predicate,
      original.object,
      original.graph
    );
  }
}

export const {
  namedNode,
  blankNode,
  literal,
  variable,
  defaultGraph,
  quad,
  fromTerm,
  fromQuad,
} = DataFactory;
