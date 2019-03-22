import { Request, Response } from 'express'
import { classifications, concepts, items } from '../core/search'
import data from '../core/data'
import { Query, SearchResponse, LabelDetailObj, SearchResultType, SearchResult } from '../types/server'
import { SchemaType } from '../types/generic'
import { CatalogSchema } from 'common-catalog-schema'

const transformToLabelResult = (type: SchemaType) => (result: {item: string, score: number}) => {
  return {
    type,
    value: result.item,
    score: result.score
  }
}

const getLabelResults = (label: string) => {
  const classificationResults = classifications.search(label).map(transformToLabelResult(SchemaType.classification))
  const conceptResults = concepts.search(label).map(transformToLabelResult(SchemaType.concept))
  const itemResults = items.search(label).map(transformToLabelResult(SchemaType.item))
  const allResults = [...classificationResults, ...conceptResults, ...itemResults]
  return allResults.sort((a, b) => b.score - a.score)
}

const getSearchResult = (data: CatalogSchema, labels: string[], labelSearchDetail: LabelDetailObj): SearchResult => {
  // const exactItemFound = labelSearch
  return {
    itemFound: false,
    type: SearchResultType.directMatchSingleItem
  }
}

export default (req: Request, res: Response) => {
  const { labels: rawLabels } = req.query as Query

  const labels: string[] = rawLabels.split(',')
  const labelSearchDetail: LabelDetailObj = labels.reduce((prev, label) => ({ ...prev, [label]: getLabelResults(label) }), {})

  res.json({
    input: labels,
    labelDetail: labelSearchDetail,
    disambiguation: [],
    searchResult: getSearchResult(data, labels, labelSearchDetail)
  } as SearchResponse)
}
