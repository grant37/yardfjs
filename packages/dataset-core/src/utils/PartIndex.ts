import PartKey from './PartKey';
import SecondPartIndex from './SecondPartIndex';
import ThirdPartIndex from './ThirdPartIndex';
import isValidId from './isValidId';

export default class PartIndex extends Map<number, SecondPartIndex> {
  keyType: PartKey;

  graphId: number;

  constructor(keyType: PartKey, graphId: number) {
    super();
    this.graphId = graphId;
    this.keyType = keyType;
  }

  /**
   * Return an array of quads as ids where target part id matches for a given graph.
   * If all arguments are wildcards, return all quads.
   */
  match(...args: number[]): [number, number, number, number][] {
    const result = [];
    const termsToMatch = args.filter(isValidId).length;
    const [matchId1, matchId2, matchId3] = args;

    switch (termsToMatch) {
      case 0: {
        this.forEach((secondPartIndex: SecondPartIndex, id1) => {
          secondPartIndex.forEach((thirdPartIndex: ThirdPartIndex, id2) => {
            thirdPartIndex.forEach((id3: number) => {
              const ids = this.getOrderedIds(id1, id2, id3);
              result.push(ids);
            });
          });
        });

        return result;
      }
      case 1: {
        const secondIndex = this.get(matchId1);

        if (!secondIndex) {
          return result;
        }

        secondIndex.forEach((thirdIndex: ThirdPartIndex, id2: number) => {
          thirdIndex.forEach((id3: number) => {
            const ids = this.getOrderedIds(matchId1, id2, id3);
            result.push(ids);
          });
        });

        return result;
      }
      case 2: {
        const thirdIndex = this.get(matchId1)?.get(matchId2);

        if (!thirdIndex) {
          return result;
        }

        thirdIndex.forEach((id3: number) => {
          const ids = this.getOrderedIds(matchId1, matchId2, id3);
          result.push(ids);
        });

        return result;
      }
      case 3: {
        if (!this.get(matchId1)?.get(matchId2)?.has(matchId3)) {
          return result;
        }

        const ids = this.getOrderedIds(matchId1, matchId2, matchId3);
        result.push(ids);

        return result;
      }
      default:
        throw new Error('Invalid number of arguments');
    }
  }

  private getOrderedIds = (
    id1: number,
    id2: number,
    id3: number
  ): [number, number, number, number] => {
    switch (this.keyType) {
      case 'subjects':
        // s -> p -> o
        return [id1, id2, id3, this.graphId];
      case 'predicates':
        // p -> o -> s
        return [id3, id1, id2, this.graphId];
      case 'objects':
        // o -> s -> p
        return [id2, id3, id1, this.graphId];
      default:
        throw new TypeError(`Invalid keyType was: ${this.keyType}`);
    }
  };
}
