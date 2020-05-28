import { Request, Response } from 'express'
import store from '../core/data'
import { Query, SearchResponse, LabelSearchResult, LabelResult } from '../types/server'
import { SchemaType, DataStore } from '../types/generic'
import { FuseResult } from '../types/search'
import { focusLabelResult, identifyItem, LabelFocusedResult } from '../modules/findItem'

const transformToLabelResult = <T>(type: SchemaType) => (result: FuseResult<T>) => {
  return {
    type,
    value: result.item,
    // matches: result.matches,
    score: result.score
  }
}

const getLabelResults = (store: DataStore, realm: string, label: string)
  : {classifications: LabelResult[], items: LabelResult[], concepts: LabelResult[]} => {
  const classificationResults = store[realm].classificationSearch.search(label).map(transformToLabelResult(SchemaType.classification))
  const itemResults = store[realm].itemSearch.search(label).map(transformToLabelResult(SchemaType.item))
  const conceptValueResults = store[realm].conceptValueSearch.search(label).map(transformToLabelResult(SchemaType.concept))
  return {
    classifications: classificationResults.sort((a, b) => b.score - a.score),
    items: itemResults.sort((a, b) => b.score - a.score),
    concepts: conceptValueResults.sort((a, b) => b.score - a.score)
  }
}

export default (req: Request, res: Response) => {
  const { labels: rawLabels, realm = 'coffee-shop' } = req.query as Query
  const realmData = store[realm]
  const data = realmData.data

  const labels: string[] = rawLabels.toLowerCase().split(',').map(_ => _.trim())
  const labelSearchResults: LabelSearchResult[] = labels.map(label => {
    const results = getLabelResults(store, realm, label)
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
  } as SearchResponse)
}
