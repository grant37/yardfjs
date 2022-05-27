import CanonicalizationState from './CanonicalizationState';

const hashFirstDegreeQuads = (
  state: CanonicalizationState,
  bNodeId: string
) => {
  const nQuads = [];
  const quads = state.blankNodesToQuadsMap.get(bNodeId);

  quads.forEach((quad) => {
    const { subject, predicate, object, graph } = quad;

    // TODO: canonical forms. This should likely use dataset serialization
    // capabilities.
    if (graph.value !== '') {
      nQuads.push(`${subject} ${predicate} ${object} ${graph} .`);
    } else {
      nQuads.push(`${subject} ${predicate} ${object} .`);
    }
  });
};
