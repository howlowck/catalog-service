import { Request, Response } from 'express'
import { Query } from '../types/server'
// import { conceptValues } from '../core/search'
import { ItemDefinition } from 'common-catalog-schema'
import { findDisambiguationValues } from '../modules/findItem'
import store from '../core/data'
import { convertSearchPairingToConceptValue } from '../util/string'
import { findMostSimilarItem } from '../modules/transformItem'
import { flatSingle } from '../util/array'

interface TransformItem {
  label: string,
  item: ItemDefinition
}

interface TransformResponse {
  input: string[],
  result: TransformItem[]
}

export default (req: Request, res: Response) => {
  const { item: idRaw, attributes: rawAttrs, realm = 'coffee-shop' } = req.query as Query
  const id: string = idRaw.toLowerCase().trim()
  const attributes: string[] = rawAttrs.toLowerCase().split(',').map(_ => _.trim())
  const itemFound = store[realm].data.items.find(_ => _.id === id)

  if (!itemFound) {
    throw new Error(`The id you gave is not in the catalog data, please make sure it is correct: ${id}`)
  }

  // let result: ItemDefinition | null = null
  const result: TransformItem[] = attributes.reduce((prev, curr) => {
    const referenceItem = (prev[prev.length - 1] && prev[prev.length - 1].item) || itemFound
    const resultPreFiltered = store[realm].conceptValueSearch.search(curr).map(rs => ({ ...rs, ...convertSearchPairingToConceptValue(rs.item) }))
    const candidateItemsPerConcept = resultPreFiltered
      .filter(_ => referenceItem.disambiguationAttributes.some(itemAttribute => itemAttribute.conceptId === _.conceptId))
      .map(rs => {
        const associatedItems = store[realm].data.items.filter(item => item.disambiguationAttributes.some(_ => _.conceptId === rs.conceptId && _.value === rs.key))
        return associatedItems
      })

    const candidateItems = flatSingle(candidateItemsPerConcept)
    const newItem = findMostSimilarItem(store[realm].data, referenceItem, candidateItems)
    if (!newItem) {
      return prev
    }

    return [...prev, { label: curr, item: newItem }]
  }, [] as TransformItem[])

  res.json({
    input: attributes,
    result
  })
}
