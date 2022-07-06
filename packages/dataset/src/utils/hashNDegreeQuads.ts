import { Quad, Term } from '@yardfjs/data-factory';
import CanonicalizationState from './CanonicalizationState';
import IdentifierIssuer from './IdentifierIssuer';
import { Sha256 } from '@aws-crypto/sha256-universal';
import generate from './generateListPermutations';
import hashFirstDegreeQuads from './hashFirstDegreeQuads';
import { isBlankNode } from './termType';
import serializeTerm from './serializeTerm';

type HashRelatedBlankNodeArgs = {
  state: CanonicalizationState;
  bNodeId: string;
  term: Term;
  quad: Quad;
  issuer: IdentifierIssuer;
  position: string;
  hashToRelatedBlankNodesMap: Map<string, string[]>;
};

const hashRelatedBlankNodes = async ({
  state,
  bNodeId,
  term,
  quad,
  issuer,
  position,
  hashToRelatedBlankNodesMap,
}: HashRelatedBlankNodeArgs): Promise<void> => {
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

  const result = (await hash.digest()).join('');

  if (!hashToRelatedBlankNodesMap.has(result)) {
    hashToRelatedBlankNodesMap.set(result, []);
  }

  hashToRelatedBlankNodesMap.get(result).push(relatedId);
};

const hashNDegreeQuads = async (
  state: CanonicalizationState,
  bNodeId: string,
  issuer: IdentifierIssuer
): Promise<[IdentifierIssuer, string]> => {
  let currentIssuer = issuer;
  const hashToRelatedBlankNodesMap = new Map<string, string[]>();
  const quads = state.blankNodesToQuadsMap.get(bNodeId);
  const toHash = (quad: Quad) => (term: Term, i: number) =>
    hashRelatedBlankNodes({
      state,
      bNodeId,
      term,
      quad,
      issuer: currentIssuer,
      position: (i === 0 && 's') || (i === 1 && 'o') || 'g',
      hashToRelatedBlankNodesMap,
    });

  for (const quad of quads) {
    const { subject, object, graph } = quad;
    await Promise.all([subject, object, graph].map(toHash(quad)));
  }

  let dataToHash = '';

  const hashes = Array.from(hashToRelatedBlankNodesMap.keys()).sort();
  const shouldSkipToNext = (path: string, chosenPath: string) =>
    chosenPath.length > 0 &&
    path.length >= chosenPath.length &&
    path.localeCompare(chosenPath) > 0;

  for (const hash of hashes) {
    const blankNodeIds = hashToRelatedBlankNodesMap.get(hash);
    dataToHash += hash;
    let chosenPath = '';
    let chosenIssuer: IdentifierIssuer;
    const perms = generate<string>(blankNodeIds.length, blankNodeIds);

    for (const list of perms) {
      const issuerCopy = currentIssuer.copy();
      const recursionList: string[] = [];
      let path = '';
      list.forEach((related) => {
        if (issuerCopy.hasId(related)) {
          path += related;
          return;
        }

        recursionList.push(related);
        path += issuerCopy.issue(related);
      });

      if (shouldSkipToNext(path, chosenPath)) {
        continue;
      }

      let skip = false;
      for (const related of recursionList) {
        const result = await hashNDegreeQuads(state, related, issuerCopy);
        path += issuerCopy.issue(related);
        path += `<${result}>`;

        if (shouldSkipToNext(path, chosenPath)) {
          skip = true;
          break;
        }
      }

      if (skip) {
        continue;
      }

      if (chosenPath.length === 0 || path.localeCompare(chosenPath) < 0) {
        chosenPath = path;
        chosenIssuer = issuerCopy;
      }
    }

    dataToHash += chosenPath;
    currentIssuer = chosenIssuer;
  }

  const finalHash = new Sha256();
  finalHash.update(dataToHash);

  return [currentIssuer, (await finalHash.digest()).join('')];
};

export default hashNDegreeQuads;
