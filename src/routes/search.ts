import { Request, Response } from 'express'
import { classifications, items, conceptValues } from '../core/search'
import data from '../core/data'
import { Query, SearchResponse, LabelSearchResult, LabelResult } from '../types/server'
import { SchemaType } from '../types/generic'
import graph, { conceptId, classId } from '../core/graph'
import { FuseResult, ConceptValue } from '../types/search'
import { intersect } from '../util/array'
import { focusLabelResult, identifyItem, LabelFocusedResult } from '../modules/findItem'

const transformToLabelResult = <T>(type: SchemaType) => (result: FuseResult<T>) => {
  return {
    type,
    value: result.item,
    // matches: result.matches,
    score: result.score
  }
}

const getLabelResults = (label: string)
  : {classifications: LabelResult[], items: LabelResult[], concepts: LabelResult[]} => {
  const classificationResults = classifications.search(label).map(transformToLabelResult(SchemaType.classification))
  const itemResults = items.search(label).map(transformToLabelResult(SchemaType.item))
  const conceptValueResults = conceptValues.search(label).map(transformToLabelResult(SchemaType.concept))
  return {
    classifications: classificationResults.sort((a, b) => b.score - a.score),
    items: itemResults.sort((a, b) => b.score - a.score),
    concepts: conceptValueResults.sort((a, b) => b.score - a.score)
  }
}

const itemsWithConceptsAndClassification = (itemsWithClassification: string[]) => (conceptValue: ConceptValue) => {
  const node = graph.getNode(conceptId(conceptValue.conceptId))
  if (!node) {
    throw new Error(`there is no concept with id: "${conceptId}"`)
  }

  // tslint:disable-next-line: strict-type-predicates
  node.links = node.links === null ? [] : node.links
  const itemsWithConceptValue: string[] = node.links
    .filter(_ => _.data.value === conceptValue.key && (_.toId as string).startsWith('item'))
    .map(_ => (_.toId as string).slice(5))

  const itemsFound = intersect(itemsWithClassification, itemsWithConceptValue)
  return {
    conceptId: conceptValue.conceptId,
    key: conceptValue.key,
    itemsFound
  }
}

export const findItemsWithClassification = (classification: string, conceptValues: ConceptValue[]) => {
  const classificationNode = graph.getNode(classId(classification))
  if (!classificationNode) {
    return []
  }

  const itemsWithClassification: string[] = classificationNode.links
    .filter((_) => (_.fromId as string).startsWith('item') && (_.toId as string).startsWith('classification')) // only item->classification relationships
    .map(_ => (_.fromId as string).slice(5)) // ['pork-egg-rolls', 'chicken-egg-rolls']

  const conceptValuesWithItems = conceptValues.map(itemsWithConceptsAndClassification(itemsWithClassification)).filter(_ => _.itemsFound.length > 0)

  return conceptValuesWithItems
}

export default (req: Request, res: Response) => {
  const { labels: rawLabels } = req.query as Query

  const labels: string[] = rawLabels.toLowerCase().split(',').map(_ => _.trim())
  const labelSearchResults: LabelSearchResult[] = labels.map(label => {
    const results = getLabelResults(label)
    return { label, ...results }
  })

  const focusedLabelResults: LabelFocusedResult[] = labelSearchResults.map(lsr => {
    return {
      label: lsr.label,
      result: focusLabelResult(data, labelSearchResults, lsr.label)
    }
  })

  const itemIdentified = identifyItem(data, labelSearchResults, focusedLabelResults)

  res.json({
    input: labels,
    itemIdentified,
    labelSearchResults,
    focusedLabelResults
    // disambiguation: [],
    // searchResult: getSearchResult(data, labels),
    // itemClassificationHeuristics: itemsFoundPerClassification
  } as SearchResponse)
}
