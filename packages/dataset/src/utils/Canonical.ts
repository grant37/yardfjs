import CanonicalizationState from './CanonicalizationState';
import Dataset from '../Dataset';

export default class Canonical {
  private state: CanonicalizationState = new CanonicalizationState();

  constructor(dataset: Dataset) {
    dataset.forEach((quad) => {
      this.state.blankNodesToQuadsMap.add(quad);
    });

    let simple = true;

    while (simple) {
      simple = false;
      this.state.hashToBlankNodesMap.clear();
    }
  }
}
