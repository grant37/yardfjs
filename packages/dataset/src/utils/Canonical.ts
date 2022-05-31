import BlankNodesToQuadsMap from './BlankNodesToQuadsMap';
import CanonicalizationState from './CanonicalizationState';
import Dataset from '../Dataset';
import IdentifierIssuer from './IdentifierIssuer';
import hashFirstDegreeQuads from './hashFirstDegreeQuads';
import hashNDegreeQuads from './hashNdegreeQuads';

export default class Canonical {
  private state: CanonicalizationState;

  private sortedHashes?: string[];

  constructor(dataset: Dataset) {
    const idsMap = new Map<string, string>();
    this.state.canonicalIssuer = new IdentifierIssuer(idsMap);

    this.state.hashToBlankNodesMap = new Map();
    this.state.blankNodesToQuadsMap = new BlankNodesToQuadsMap();

    dataset.forEach((quad) => {
      this.state.blankNodesToQuadsMap.add(quad);
    });
  }

  async run() {
    await this.runForFirstDegreeQuads();
    await this.runForNDegreeQuads();
  }

  // Note this avoids the loop given on purpose the explanation here:
  // https://json-ld.github.io/rdf-dataset-canonicalization/spec/#hash-first-degree-quads
  private async runForFirstDegreeQuads() {
    this.state.hashToBlankNodesMap.clear();

    const bNodeIds = this.state.blankNodesToQuadsMap.keys();
    for (const bNodeId of bNodeIds) {
      const hash = await hashFirstDegreeQuads(
        this.state.blankNodesToQuadsMap,
        bNodeId
      );

      if (this.state.hashToBlankNodesMap.has(hash)) {
        this.state.hashToBlankNodesMap.get(hash).push(bNodeId);
      } else {
        this.state.hashToBlankNodesMap.set(hash, [bNodeId]);
      }
    }

    const hashes = Array.from(this.state.hashToBlankNodesMap.keys()).sort();
    hashes.forEach((hash) => {
      const identifierList = this.state.hashToBlankNodesMap.get(hash);

      if (identifierList.length > 1) {
        return;
      }

      const [id] = identifierList;
      this.state.canonicalIssuer.issue(id);

      this.state.blankNodesToQuadsMap.delete(id);
      this.state.hashToBlankNodesMap.delete(hash);
    });

    this.sortedHashes = hashes.filter((hash) =>
      this.state.hashToBlankNodesMap.has(hash)
    );
  }

  private async runForNDegreeQuads() {
    const hashes =
      this.sortedHashes ||
      Array.from(this.state.hashToBlankNodesMap.keys()).sort();

    for (const hash of hashes) {
      const hashPathList = [];
      const identifiers = this.state.hashToBlankNodesMap.get(hash);

      for (const id of identifiers) {
        if (this.state.canonicalIssuer.hasId(id)) {
          continue;
        }

        const issuedIds = new Map<string, string>();
        const tmpIssuer = new IdentifierIssuer(issuedIds, '_:b');
        const tmpId = tmpIssuer.issue(id);

        await hashNDegreeQuads(this.state, tmpId, tmpIssuer);
      }
    }
  }
}
