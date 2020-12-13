// { subjects: { 1 => { 2 => { 3 } } } }
export type PartIndex = 'subjects' | 'predicates' | 'objects';
export type ThirdIndex = Set<number>;
export type SecondIndex = Map<number, ThirdIndex>;
export type FirstIndex = Map<number, SecondIndex>;
export type Graph = Map<PartIndex, FirstIndex>;
export type GraphIndex = Map<number, Graph>;
