import BlankNodesToQuadsMap from './BlankNodesToQuadsMap';
import IdentifierIssuer from './IdentifierIssuer';

export default class CanonicalizationState {
  /**
   * Maps blank node identifier to the quads in which it appears.
   */
  blankNodesToQuadsMap: BlankNodesToQuadsMap = new BlankNodesToQuadsMap();

  /**
   * Maps a has to a list of blank node identifiers.
   */
  hashToBlankNodesMap: Map<string, string[]> = new Map();

  canonicalIssuer: IdentifierIssuer = new IdentifierIssuer();
}
