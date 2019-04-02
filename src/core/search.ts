import Fuse from 'fuse.js'
import data from './data'
import { flatSingle } from '../util/array'
import { FuseResult, MakeSearchOutput, ConceptValueItem } from '../types/search'
import { Classification, Concept, ItemDefinition } from 'common-catalog-schema'

const conceptArray = data.concepts.map((concept) => {
  const names = !concept.values ? [] : concept.values.reduce((prev: string[], current) => {
    const synonyms = current.synonyms || []
    return [...prev, current.value, ...synonyms]
  }, [])

  return {
    id: concept.id,
    displayName: concept.displayName,
    names
  }
})

const conceptValueArray: ConceptValueItem[] = flatSingle(data.concepts.map((concept) => {
  const { values, id } = concept
  if (!values) {
    return []
  }

  return values.map((value) => {
    return {
      id: `${id}:${value.value}`,
      key: value.value,
      names: value.synonyms || []
    }
  })
}))

export const classificationSearch = new Fuse(data.classifications, {
  id: 'id',
  threshold: 0.3,
  distance: 0,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
  findAllMatches: true,
  keys: [
    'name',
    'synonyms'
  ]
})

export const conceptSearch = new Fuse(conceptArray, {
  id: 'id',
  threshold: 0.3,
  distance: 0,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
  findAllMatches: true,
  keys: [
    'names'
  ]
})

export const itemSearch = new Fuse(data.items, {
  id: 'id',
  threshold: 0.4,
  // distance: 3,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
  findAllMatches: true,
  keys: [
    { name: 'displayName', weight: 1 },
    { name: 'commonNames', weight: 1 }
  ]
})

export const conceptValueSearch = new Fuse(conceptValueArray, {
  id: 'id',
  threshold: 0.3,
  distance: 0,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
  findAllMatches: true,
  keys: [
    { name: 'key', weight: 1 },
    { name: 'names', weight: 1 }
  ]
})

const makeSearch = <T>(searchIndex: Fuse<any>): MakeSearchOutput<T> => {
  return {
    search: (searchTerm: string) => {
      return searchIndex.search(searchTerm).map(_ => ({
        item: _.item,
        score: 1 - (_.score as number),
        matches: _.matches
      }))
    }
  }
}

export const classifications = makeSearch<string>(classificationSearch)
export const concepts = makeSearch<string>(conceptSearch)
export const items = makeSearch<string>(itemSearch)
export const conceptValues = makeSearch<string>(conceptValueSearch)
