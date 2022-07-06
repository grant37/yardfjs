import { Term } from '@yardfjs/data-factory';

export const isBlankNode = (term: Term) => term.termType === 'BlankNode';
export const isDefaultGraph = (term: Term) => term.termType === 'DefaultGraph';
