import { ConceptValue } from '../types/search'
import { CatalogSchema, ItemDefinition, Concept } from 'common-catalog-schema'
import { LabelResult, LabelSearchResult } from '../types/server'
import { convertSearchPairingToConceptValue } from '../util/string'
import { intersect } from '../util/array'

export interface ConceptAssociation {
  conceptId: string,
  associations: ConceptItemAssociation[]
}

export interface ConceptItemAssociation {
  conceptValue: string,
  itemId: string
}

export interface FilterResult<T> {
  identified: T | null,
  remaining: T[]
}

export interface LabelFocusedResult {
  label: string,
  result: {identified: ConceptAssociation[], remaining: ConceptAssociation[]}
}

export const getCandidateItemsFromLabelSearchResult = (data: CatalogSchema, labelResult: LabelSearchResult): ItemDefinition[] => {
  const itemIds = labelResult.items.map(_ => _.value)

  if (labelResult.classifications.length === 0) {
    return data.items.filter(_ => itemIds.includes(_.id))
  }

  const classificationIds = labelResult.classifications.map(_ => _.value)
  return data.items.filter(_ => classificationIds.includes(_.classification.classificationId))
}

/**
 * Finds disambiguation based on a list of items
 * @param data Data
 * @param itemIds List of item ids
 * @returns ConceptAssociation[]
 */
export const findDisambiguationValues = (items: ItemDefinition[]): ConceptAssociation[] => {
  const conceptAssociations = items.reduce((prev, curr, i) => {
    const currDisAttrs = curr.disambiguationAttributes
    if (currDisAttrs.length === 0) {
      return prev
    }
    const singleItemAssociation = currDisAttrs.reduce((inPrev: ConceptAssociation[], currDisAttr) => {
      const conceptAssociationFound = inPrev.find(_ => _.conceptId === currDisAttr.conceptId)
      if (conceptAssociationFound) {
        conceptAssociationFound.associations = [
          ...conceptAssociationFound.associations,
          {
            conceptValue: currDisAttr.value.toString(),
            itemId: curr.id
          }]
        return inPrev
      }
      return [
        ...inPrev,
        {
          conceptId: currDisAttr.conceptId,
          associations: [{
            conceptValue: currDisAttr.value.toString(),
            itemId: curr.id
          }]
        }
      ]
    }, prev)

    return singleItemAssociation
  }, [] as ConceptAssociation[])

  return conceptAssociations
}

/**
 * Filters out concept associations
 */
export const filterDisambiguationValues = (associations: ConceptAssociation[], conceptValues: ConceptValue[]): FilterResult<ConceptAssociation> => {
  const conceptValueFound = conceptValues.find((conceptValue) => {
    const associationFoundWithName = associations.find(_ => _.conceptId === conceptValue.conceptId)
    if (!associationFoundWithName) {
      return false
    }
    return associationFoundWithName.associations.some(_ => _.conceptValue === conceptValue.key)
  })

  if (!conceptValueFound) {
    return {
      identified: null,
      remaining: associations
    }
  }

  const identifiedPreAssociation = associations.find(_ => _.conceptId === conceptValueFound.conceptId) as ConceptAssociation

  const identified: ConceptAssociation = {
    conceptId: identifiedPreAssociation.conceptId,
    associations: identifiedPreAssociation.associations.filter(_ => _.conceptValue === conceptValueFound.key)
  }

  const validItemIds = identified.associations.map(_ => _.itemId)

  const remainingPreFilter = associations.filter(_ => _.conceptId !== conceptValueFound.conceptId)
  const remaining = remainingPreFilter.map(association => {
    return {
      conceptId: association.conceptId,
      associations: association.associations.filter(_ => validItemIds.includes(_.itemId))
    }
  })

  return {
    identified,
    remaining
  }
}

export const focusLabelResult = (data: CatalogSchema, searchResult: LabelSearchResult[], label: string): {identified: ConceptAssociation[], remaining: ConceptAssociation[]} => {
  const labelResult = searchResult.find(_ => _.label === label)
  if (!labelResult) {
    throw new Error(`The label you are looking for is not in the search result: ${label}`)
  }

  const otherLabelResults = searchResult.filter(_ => _.label !== label)
  const otherLabelConceptValues = otherLabelResults.map(lr => {
    return {
      label: lr.label,
      conceptValues: lr.concepts.map(_ => convertSearchPairingToConceptValue(_.value))
    }
  })

  const items = getCandidateItemsFromLabelSearchResult(data, labelResult)

  const conceptAssociations = findDisambiguationValues(items)

  let identified: ConceptAssociation[] = []

  const remaining = otherLabelConceptValues.reduce((prev, lcv) => {
    const filterResult = filterDisambiguationValues(prev, lcv.conceptValues)
    if (filterResult.identified) {
      identified.push(filterResult.identified)
    }
    return filterResult.remaining
  }, conceptAssociations)

  return { identified, remaining }
}

export const identifyItem = (data: CatalogSchema, labelSearchResults: LabelSearchResult[], focusedLabelResults: LabelFocusedResult[]): ItemDefinition | null => {
  let itemFound: LabelResult | null = null

  const exactItemFound = labelSearchResults.find(_ => {
    itemFound = _.items.find(item => item.score === 1) || null
    return !!itemFound
  })

  if (exactItemFound && itemFound) {
    const itemId = (itemFound as LabelResult).value
    return data.items.find(_ => _.id === itemId) || null
  }

  const sortedResultLength = focusedLabelResults.sort((a, b) => b.result.identified.length - a.result.identified.length)
  if (sortedResultLength.length < 1) {
    return null
  }
  const longestResult = sortedResultLength[0]
  if (longestResult.result.identified.length < 1) {
    return null
  }

  const resultLength = longestResult.result.identified.length

  const lastIdentified = longestResult.result.identified[resultLength - 1]

  const associationLength = lastIdentified.associations.length

  if (associationLength === 1) {
    return data.items.find(_ => _.id === lastIdentified.associations[associationLength - 1].itemId) || null
  }

  if (associationLength > 1) {
    // needs to do some filtering on the remaining to see if there would be any left
    // loop over the remainer item associations and see if the remaining concepts are in associations
    const remainingAttributes = longestResult.result.remaining.map(_ => _.conceptId)
    const itemsWithoutRemainingAttributes = lastIdentified.associations.filter(association => {
      const item = data.items.find(_ => _.id === association.itemId) as ItemDefinition
      const attributeIdsInItem = item.disambiguationAttributes.map(_ => _.conceptId)
      // if there are no overlap, return true
      const intersectAttributes = intersect(attributeIdsInItem, remainingAttributes)
      return intersectAttributes.length === 0
    })
    if (itemsWithoutRemainingAttributes.length === 1) {
      return data.items.find(_ => _.id === itemsWithoutRemainingAttributes[0].itemId) || null
    }
  }

  return null
}
