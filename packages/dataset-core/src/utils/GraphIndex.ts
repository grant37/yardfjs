import Graph from './Graph';

class GraphIndex extends Map<number, Graph> {
  addTerm(sId: number, pId: number, oId: number, gId: number): void {
    let graph = this.get(gId);

    if (!graph) {
      graph = new Graph(gId);
      this.set(gId, graph);
    }

    graph.addTerm(sId, pId, oId);
  }
}

export default GraphIndex;
