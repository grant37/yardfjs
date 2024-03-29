import { Literal, Term } from '@yardfjs/data-factory';

/**
 * Stores a map of terms to term IDs and vice versa.
 */
export default class TermIndex {
  static MIN_ID = 1;

  /**
   * Converts a term to a value for internal representation. This is for indexing
   * purposes only, so it's not the canonical serialization of the term.
   */
  static toRawValue = (term: Term): string => {
    switch (true) {
      case term.termType === 'Literal':
        return `${term.termType.substring(0, 1)}${term.value}${
          (term as Literal).language || (term as Literal).dataType.value
        }`;
      default:
        return `${term.termType.substring(0, 1)}${term.value}`;
    }
  };

  constructor(data?: [number, string, Term][]) {
    if (!data) {
      return;
    }

    data.forEach(([id, value, term]) => {
      this.ids.set(value, id);
      this.values.set(id, value);
      this.terms.set(id, term);
    });
  }

  /**
   * Create a new term index from a subset of this one.
   */
  fromIds(ids: number[]): TermIndex {
    const data = [];

    ids.forEach((id) => {
      const value = this.values.get(id);
      const term = this.terms.get(id);
      data.push([id, value, term]);
    });

    return new TermIndex(data);
  }

  /**
   * Insert the term into the index.
   * @returns the term ID
   */
  addTerm(term: Term): number {
    const key = TermIndex.toRawValue(term);

    if (this.ids.has(key)) {
      return this.ids.get(key);
    }

    const nextID = this.size + 1;

    this.ids.set(key, nextID);
    this.values.set(nextID, key);
    this.terms.set(nextID, term);

    return nextID;
  }

  deleteTerm(termOrId: Term | number): void {
    const key =
      typeof termOrId === 'number'
        ? this.values.get(termOrId)
        : TermIndex.toRawValue(termOrId);

    if (!this.ids.has(key)) {
      return;
    }

    const id = this.ids.get(key);

    this.ids.delete(key);
    this.values.delete(id);
    this.terms.delete(id);
  }

  getTermId(term: Term): number | undefined {
    const key = TermIndex.toRawValue(term);
    return this.ids.get(key);
  }

  /**
   * Get the term by ID.
   */
  getTerm(id: number): Term {
    return this.terms.get(id);
  }

  get size() {
    return this.ids.size;
  }

  /**
   * Map of term values to internal IDs. Internal ids start at 0.
   */
  private ids: Map<string, number> = new Map();

  /**
   * Map of internal IDs to term values.
   */
  private values: Map<number, string> = new Map();

  /**
   * Map of internal ids to terms.
   */
  private terms: Map<number, Term> = new Map();
}
