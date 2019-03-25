import { Request, Response } from 'express'
import { classifications, concepts, items, conceptValues } from '../core/search'
import data from '../core/data'
import { Query, SearchResponse, SearchResultType, SearchResult, LabelSearchResult } from '../types/server'
import { SchemaType } from '../types/generic'
import { CatalogSchema, Classification } from 'common-catalog-schema'
import graph, { graphId, conceptId, classId, itemId } from '../core/graph'
import pathFinder from '../core/pathFinder'
import { FuseResult, ConceptValue } from '../types/search'
import { Node, Link } from 'ngraph.graph'
import { intersect, flatSingle } from '../util/array'

const transformToLabelResult = <T>(type: SchemaType) => (result: FuseResult<T>) => {
  return {
    type,
    value: result.item,
    // matches: result.matches,
    score: result.score
  }
}

const getLabelResults = (label: string) => {
  const classificationResults = classifications.search(label).map(transformToLabelResult(SchemaType.classification))
  const conceptResults = concepts.search(label).map(transformToLabelResult(SchemaType.concept))
  const itemResults = items.search(label).map(transformToLabelResult(SchemaType.item))
  const conceptValueResults = conceptValues.search(label).map(transformToLabelResult(SchemaType.concept))
  const allResults = [...classificationResults, ...itemResults, ...conceptValueResults]
  return allResults.sort((a, b) => b.score - a.score)
}

const getSearchResult = (data: CatalogSchema, labels: string[]): SearchResult => {
  // const exactItemFound = labelSearch
  return {
    itemFound: false,
    type: SearchResultType.directMatchSingleItem
  }
}

const itemsWithConceptsAndClassification = (itemsWithClassification: string[]) => (conceptValue: ConceptValue) => {
  const node = graph.getNode(conceptId(conceptValue.conceptId))
  console.log(node)
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
  // console.log(conceptValues)

  const itemsWithClassification: string[] = classificationNode.links
    .filter((_) => (_.fromId as string).startsWith('item') && (_.toId as string).startsWith('classification')) // only item->classification relationships
    .map(_ => (_.fromId as string).slice(5)) // ['pork-egg-rolls', 'chicken-egg-rolls']

  const conceptValuesWithItems = conceptValues.map(itemsWithConceptsAndClassification(itemsWithClassification)).filter(_ => _.itemsFound.length > 0)

  // console.log('classification items', itemsWithClassification)
  return conceptValuesWithItems

  // get all the items from the classification
  // get all the disambiguationAttributes
  // ie [{value: flavor}, {value: 'pork', conceptId: 'protein'}, {value: 'chicken', conceptid: 'protein'}]
  // find all the items linked to all the attributes
  // find the interset
}

const parseConceptSearchToConceptValue = (conceptSearch: string): ConceptValue => {
  const tokens = conceptSearch.split(':')
  if (tokens.length !== 2) {
    throw new Error(`Error: this id is not a combined conceptValue: ${conceptSearch}`)
  }
  return {
    conceptId: tokens[0],
    key: tokens[1]
  }
}

export default (req: Request, res: Response) => {
  const { labels: rawLabels } = req.query as Query

  const labels: string[] = rawLabels.toLowerCase().split(',')
  const labelSearchDetail: LabelSearchResult[] = labels.map(label => {
    const results = getLabelResults(label)
    return { label, results }
  })

  const classificationsFound = labelSearchDetail.map(result => {
    return {
      label: result.label,
      classifications: result.results.filter(_ => _.type === SchemaType.classification && _.score > 0.99).map(_ => _.value)
    }
  })

  const conceptsFound = labelSearchDetail.map(_ => {
    return {
      label: _.label,
      concepts: _.results.filter(r => r.type === SchemaType.concept && r.score > 0.99).map(_ => parseConceptSearchToConceptValue(_.value))
    }
  })

  const itemsFoundPerClassification = classificationsFound.map(labelClassification => {
    const { label, classifications } = labelClassification
    const conceptValues = flatSingle(conceptsFound.filter(_ => _.label !== label).map(_ => _.concepts))
    const result = classifications.map(_ => {
      return {
        classificationId: _,
        result: findItemsWithClassification(_, conceptValues)
      }
    })
    return {
      label: label,
      classifications: result
    }
  })

  res.json({
    input: labels,
    labelSearchResults: labelSearchDetail,
    // disambiguation: [],
    // searchResult: getSearchResult(data, labels),
    itemClassificationHeuristics: itemsFoundPerClassification
  } as SearchResponse)
}
