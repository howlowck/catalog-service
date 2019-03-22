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

export const classifications = new Fuse(data.classifications, {
  id: "id",
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

export const concepts = new Fuse(conceptArray, {
  id: "id",
  threshold: 0.3,
  distance: 0,
  shouldSort: true,
  includeScore: true,
  findAllMatches: true,
  keys: [
    'names'
  ]
})

export const items = new Fuse(data.items, {
  id: "id",
  threshold: 0.4,
  // distance: 3,
  shouldSort: true,
  includeScore: true,
  findAllMatches: true,
  keys: [
    { name: 'displayName', weight: 0.7 },
    { name: 'commonNames', weight: 0.4 }
  ]
})
