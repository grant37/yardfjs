export declare global {
  export type NamedNodeTermType = 'NamedNode';
  export type BlankNodeTermType = 'BlankNode';
  export type LiteralTermType = 'Literal';
  export type VariableTermType = 'Variable';
  export type DefaultGraphTermType = 'DefaultGraph';
  export type QuadTermType = 'Quad';

  export type TermType =
    | NamedNodeTermType
    | BlankNodeTermType
    | LiteralTermType
    | VariableTermType
    | DefaultGraphTermType
    | QuadTermType;
}
