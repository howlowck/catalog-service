import Fuse from 'fuse.js'
import data from './data'

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

export const classificationSearch = new Fuse(data.classifications, {
  id: 'id',
  threshold: 0.3,
  distance: 0,
  shouldSort: true,
  includeScore: true,
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
  findAllMatches: true,
  keys: [
    { name: 'displayName', weight: 1 },
    { name: 'commonNames', weight: 0.7 }
  ]
})

const makeSearch = (searchIndex: Fuse<any>) => {
  return {
    search: (searchTerm: string) => {
      return searchIndex.search(searchTerm).map(_ => ({
        item: _.item,
        score: 1 - (_.score as number)
      }))
    }
  }
}

export const classifications = makeSearch(classificationSearch)
export const concepts = makeSearch(conceptSearch)
export const items = makeSearch(itemSearch)
