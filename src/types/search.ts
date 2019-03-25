export interface FuseResult<T> {
  item: T,
  matches: MatchItem[],
  score: number
}

export interface MatchItem {
  indices: Array<[number, number]>,
  value: string,
  key: string,
  arrayIndex: number
}

export interface MakeSearchOutput<T> {
  search: (searchTerm: string) => FuseResult<T>[]
}

export interface ConceptValueItem {
  id: string,
  key: string,
  names: string[]
}

export interface ConceptValue {
  conceptId: string,
  key: string
}
