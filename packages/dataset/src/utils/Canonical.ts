import DataFactory, { Term } from '@yardfjs/data-factory';
import BlankNodesToQuadsMap from './BlankNodesToQuadsMap';
import CanonicalizationState from './CanonicalizationState';
import Dataset from '../Dataset';
import IdentifierIssuer from './IdentifierIssuer';
import hashFirstDegreeQuads from './hashFirstDegreeQuads';
import hashNDegreeQuads from './hashNdegreeQuads';
import { isBlankNode } from './termType';

export default class Canonical {
  private state: CanonicalizationState;

  private sortedHashes?: string[];

  private providedDataset: Dataset;

  private factory: DataFactory = new DataFactory();

  constructor(dataset: Dataset) {
    this.providedDataset = dataset;
    const idsMap = new Map<string, string>();
    this.state = {
      canonicalIssuer: new IdentifierIssuer(idsMap),
      hashToBlankNodesMap: new Map(),
      blankNodesToQuadsMap: new BlankNodesToQuadsMap(),
    };

    dataset.forEach((quad) => {
      this.state.blankNodesToQuadsMap.add(quad);
    });
  }

  async run(): Promise<Dataset> {
    if (this.state.blankNodesToQuadsMap.size === 0) {
      return this.providedDataset;
    }

    await this.runForFirstDegreeQuads();
    await this.runForNDegreeQuads();

    return this.providedDataset.reduce((acc, quad) => {
      const subject = this.getCanonicalTerm(quad.subject);
      const object = this.getCanonicalTerm(quad.object);
      const graph = this.getCanonicalTerm(quad.graph);

      const canonicalQuad = this.factory.quad(
        subject,
        this.factory.fromTerm(quad.predicate),
        object,
        graph
      );

      return acc.add(canonicalQuad);
    }, new Dataset());
  }

  private getCanonicalTerm = (term: Term): Term => {
    if (!isBlankNode(term)) {
      return this.factory.fromTerm(term);
    }

    const canonicalValue = this.state.canonicalIssuer.issuedIdentifiers.get(
      term.value
    );

    return this.factory.blankNode(canonicalValue);
  };

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
      const hashPathList: [IdentifierIssuer, string][] = [];
      const identifiers = this.state.hashToBlankNodesMap.get(hash);

      for (const id of identifiers) {
        if (this.state.canonicalIssuer.hasId(id)) {
          continue;
        }

        const issuedIds = new Map<string, string>();
        const tempIssuer = new IdentifierIssuer(issuedIds, '_:b');
        const tempId = tempIssuer.issue(id);

        const result = await hashNDegreeQuads(this.state, tempId, tempIssuer);
        hashPathList.push(result);
      }

      hashPathList.sort((a, b) => a[1].localeCompare(b[1]));

      for (const [issuer] of hashPathList) {
        for (const id of issuer.issuedIdentifiers.keys()) {
          this.state.canonicalIssuer.issue(id);
        }
      }
    }
  }
}
