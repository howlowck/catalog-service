import createGraph from 'ngraph.graph'
import { CatalogSchema } from 'common-catalog-schema'
import { classId, itemId, conceptId } from '../util/string'

interface Option {
  includeConcepts: boolean
}

const graphBuilder = (options: Option = { includeConcepts: false }) => (data: CatalogSchema) => {

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

  if (options.includeConcepts) {
    data.concepts.forEach(concept => {
      const { id, ...rest } = concept
      g.addNode(conceptId(id), {
        ...rest
      })
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
  }

  return g
}

export default graphBuilder
