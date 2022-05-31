import { Quad } from '@yardfjs/data-factory';
import CanonicalizationState from './CanonicalizationState';
import IdentifierIssuer from './IdentifierIssuer';

const hashRelatedBlankNode = (
  state: CanonicalizationState,
  relatedBlankNodeId: string,
  quad: Quad,
  issuer: IdentifierIssuer,
  positions: 's' | 'o' | 'g'
) => {};
