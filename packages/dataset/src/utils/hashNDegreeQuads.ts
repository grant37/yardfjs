import { isBlankNode, isDefaultGraph } from './termType';
import CanonicalizationState from './CanonicalizationState';
import { Sha256 } from '@aws-crypto/sha256-universal';
import serializeTerm from './serializeTerm';
import BlankNodesToQuadsMap from './BlankNodesToQuadsMap';
import IdentifierIssuer from './IdentifierIssuer';
import hashFirstDegreeQuads from './hashFirstDegreeQuads';
import { Quad, Term } from '@yardfjs/data-factory';

const hashRelatedBlankNodes = async (
  state: CanonicalizationState,
  bNodeId: string,
  term: Term,
  quad: Quad,
  issuer: IdentifierIssuer,
  position: string,
  hashToRelatedBlankNodesMap: Map<string, string[]>
): Promise<void> => {
  if (!isBlankNode(term)) {
    return;
  }

  const relatedId = serializeTerm(term, issuer.identifierPrefix);

  if (relatedId === bNodeId) {
    return;
  }

  const identifier =
    state.canonicalIssuer.getId(relatedId) ||
    issuer.getId(relatedId) ||
    (await hashFirstDegreeQuads(state.blankNodesToQuadsMap, relatedId));

  let input = position;

  if (position !== 'g') {
    input = `${input}<${quad.predicate}>`;
  }

  input = `${input}${identifier}`;

  const hash = new Sha256();
  hash.update(input);

  const result = (await hash.digest()).join();

  if (!hashToRelatedBlankNodesMap.has(result)) {
    hashToRelatedBlankNodesMap.set(result, []);
  }

  hashToRelatedBlankNodesMap.get(result).push(relatedId);
};

const hashNDegreeQuads = async (
  state: CanonicalizationState,
  bNodeId: string,
  issuer: IdentifierIssuer
): Promise<string> => {
  const hashToRelatedBlankNodesMap = new Map<string, string[]>();
  const quads = state.blankNodesToQuadsMap.get(bNodeId);

  for (const quad of quads) {
    const { subject, object, graph } = quad;

    const resultPromises = [subject, object, graph].map((term, i) =>
      hashRelatedBlankNodes(
        state,
        bNodeId,
        term,
        quad,
        issuer,
        (i === 0 && 's') || (i === 1 && 'o') || 'g',
        hashToRelatedBlankNodesMap
      )
    );

    await Promise.all(resultPromises);
  }

  let dataToHash = '';

  hashToRelatedBlankNodesMap.forEach((relatedIds, hash) => {
    dataToHash += hash;
    let chosenPath = '';
    let chosenIssuer: IdentifierIssuer;
  });

  return '';
};

export default hashNDegreeQuads;
