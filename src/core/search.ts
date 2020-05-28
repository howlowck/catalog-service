import Fuse from 'fuse.js'
import { CatalogSchema } from 'common-catalog-schema'
import { flatSingle } from '../util/array'
import { FuseResult, MakeSearchOutput, ConceptValueItem } from '../types/search'

const conceptArray = (data: CatalogSchema) => data.concepts.map((concept) => {
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

const conceptValueArray: (data: CatalogSchema) => ConceptValueItem[] = (data) => flatSingle(data.concepts.map((concept) => {
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

export const classificationSearch = (data: CatalogSchema) => new Fuse(data.classifications, {
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

export const conceptSearch = (data: CatalogSchema) => new Fuse(conceptArray(data), {
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

export const itemSearch = (data: CatalogSchema) => new Fuse(data.items, {
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

export const conceptValueSearch = (data: CatalogSchema) => new Fuse(conceptValueArray(data), {
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

export const makeClassificationSearch = (data: CatalogSchema) => makeSearch<string>(classificationSearch(data))
export const makeConceptSearch = (data: CatalogSchema) => makeSearch<string>(conceptSearch(data))
export const makeItemSearch = (data: CatalogSchema) => makeSearch<string>(itemSearch(data))
export const makeConceptValueSearch = (data: CatalogSchema) => makeSearch<string>(conceptValueSearch(data))
