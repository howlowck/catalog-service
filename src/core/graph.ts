import createGraph from 'ngraph.graph'
import data from './data'
import { SchemaType } from '../types/generic'

export const graphId = (type: string, id: string) => {
  return type + ':' + id
}

export const classId: (id: string) => string = graphId.bind(null, SchemaType.classification)
export const conceptId: (id: string) => string = graphId.bind(null, SchemaType.concept)
export const itemId: (id: string) => string = graphId.bind(null, SchemaType.item)

const g = createGraph()
data.classifications.forEach(classification => {
  const { id, synonyms, name } = classification
  g.addNode(classId(id), {
    name,
    synonyms
  })
})

data.classifications.forEach(classification => {
  const { id, parent } = classification
  if (!parent) {
    return
  }
  g.addLink(classId(id), classId(parent))
})

data.concepts.forEach(concept => {
  const { id, ...rest } = concept
  g.addNode(conceptId(id), {
    ...rest
  })
})

// Load all items and classification association
data.items.forEach(item => {
  const { id, displayName } = item
  g.addNode(itemId(id), {
    displayName
  })

  if (item.classification && item.classification.classificationId) {
    g.addLink(itemId(id), classId(item.classification.classificationId))
  }
})

// Load disambiguation attributes -> item
data.items.forEach(item => {
  const { id, disambiguationAttributes } = item

  if (!disambiguationAttributes) {
    return
  }

  disambiguationAttributes.forEach((attribute) => {
    const { conceptId: cId, value } = attribute
    g.addLink(conceptId(cId), itemId(id), { value })
  })
})

export default g
