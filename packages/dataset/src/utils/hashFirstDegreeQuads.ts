import { isBlankNode, isDefaultGraph } from '../utils/termType';
import BlankNodesToQuadsMap from './BlankNodesToQuadsMap';
import { Sha256 } from '@aws-crypto/sha256-universal';
import serializeTerm from './serializeTerm';

const BNODE_REFERENCE_MATCH_ID = '_:a';
const BNODE_REFERENCE_NONMATCH_ID = '_:z';

const hashFirstDegreeQuads = async (
  blankNodesToQuadsMap: BlankNodesToQuadsMap,
  referenceBlankNodeId: string
): Promise<string> => {
  const quads = blankNodesToQuadsMap.get(referenceBlankNodeId);
  const nQuadsLines = [];

  quads.forEach(({ subject, predicate, object, graph }) => {
    const terms = isDefaultGraph(graph)
      ? [subject, predicate, object]
      : [subject, predicate, object, graph];

    const serialized = terms.map((term) => {
      if (!isBlankNode(term)) {
        return serializeTerm(term);
      }

      return term.value === referenceBlankNodeId
        ? BNODE_REFERENCE_MATCH_ID
        : BNODE_REFERENCE_NONMATCH_ID;
    });

    nQuadsLines.push(`${serialized.join(' ')} .`);
  });

  const hash = new Sha256();
  hash.update(nQuadsLines.sort().join('\n'));

  return (await hash.digest()).join('');
};

export default hashFirstDegreeQuads;
