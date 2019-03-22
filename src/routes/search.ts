import { Request, Response } from 'express'
import { classifications, concepts, items } from '../core/search'
import { Query, LabelSearchResultObj, SearchResponse, LabelDetailObj } from '../types/server'
import { SchemaType } from '../types/generic'

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

const getLabelResultObject = (labels: string[]): LabelDetailObj => {
  const result: LabelSearchResultObj = {}
  labels.forEach((label: string) => {
    result[label] = getLabelResults(label)
  })
  return result
}

export default (req: Request, res: Response) => {
  const { labels: rawLabels } = req.query as Query

  const labels: string[] = rawLabels.split(',')

  res.json({
    input: labels,
    labelDetail: getLabelResultObject(labels),
    disambiguation: [],
    matchingItems: []
  } as SearchResponse)
}
