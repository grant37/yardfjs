import Quad, { Graph, Object, Predicate, Subject } from './Quad';
import BlankNode from './BlankNode';
import DefaultGraph from './DefaultGraph';
import Literal from './Literal';
import NamedNode from './NamedNode';
import Variable from './Variable';

type Term = NamedNode | BlankNode | Literal | Variable | Quad | DefaultGraph;

export default class DataFactory {
  private blankNodeID: number = 0;

  namedNode(value: string): NamedNode {
    return new NamedNode(value);
  }

  blankNode(value?: string): BlankNode {
    return new BlankNode(value || `b${(++this.blankNodeID).toString()}`);
  }

  literal(value?: string, languageOrDatatype?: string | NamedNode) {
    return new Literal(value, languageOrDatatype);
  }

  variable(value: string): Variable {
    return new Variable(value);
  }

  defaultGraph(): DefaultGraph {
    return new DefaultGraph();
  }

  quad(
    subject: Subject,
    predicate: Predicate,
    object: Object,
    graph?: Graph
  ): Quad {
    return new Quad(subject, predicate, object, graph || new DefaultGraph());
  }

  fromTerm(original: Term): Term {
    switch (original.termType) {
      case 'NamedNode':
        return this.namedNode(original.value);
      case 'BlankNode':
        return this.blankNode(original.value);
      case 'Variable':
        return this.variable(original.value);
      case 'DefaultGraph':
        return this.defaultGraph();
      case 'Literal':
        return this.literal(
          original.value,
          (original as Literal).language || (original as Literal).dataType
        );
      case 'Quad':
        return this.fromQuad(original as Quad);
      default:
        throw new TypeError(
          'Unknown term type provided to DataFactory::fromTerm'
        );
    }
  }

  fromQuad(original: Quad): Quad {
    return this.quad(
      original.subject,
      original.predicate,
      original.object,
      original.graph
    );
  }
}
