import BlankNodesToQuadsMap from './BlankNodesToQuadsMap';
import IdentifierIssuer from './IdentifierIssuer';

export default interface CanonicalizationState {
  canonicalIssuer: IdentifierIssuer;

  blankNodesToQuadsMap: BlankNodesToQuadsMap;

  hashToBlankNodesMap: Map<string, string[]>;
}
