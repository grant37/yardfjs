import DatasetCore from './DatasetCore';
import { Quad } from '@yardfjs/data-factory';

export default class DatasetCoreFactory {
  static dataset(quads?: ArrayLike<Quad>): DatasetCore {
    if (!quads) {
      return new DatasetCore();
    }

    return Array.from(quads).reduce(
      (dataset: DatasetCore, quad: Quad) => dataset.add(quad),
      new DatasetCore()
    );
  }
}
