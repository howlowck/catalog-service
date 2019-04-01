import { ItemDefinition, CatalogSchema } from 'common-catalog-schema'
import path from 'ngraph.path'
import gb from '../core/graphBuilder'
import { itemId } from '../util/string'
import { Graph } from 'ngraph.graph'
import { GraphNode } from '../types/graph'
import { intersect } from '../util/array'

export const findMostSimilarItem = (data: CatalogSchema, item: ItemDefinition, candidateItems: ItemDefinition[]) => {
  const graph = gb()(data)

  // see if item is already in the candidateItems
  const originalItemFound = candidateItems.find(_ => _.id === item.id)
  if (originalItemFound) {
    return originalItemFound
  }

  // check classification
  const linkResults = candidateItems
    .map(_ => findClassificationLinks(graph, item, _))
    .filter(_ => _.length > 0)
    .sort((a, b) => a.length - b.length)

  if (linkResults.length < 1) {
    return null
  }

  const shortestResults = linkResults.filter((_, i, origArr) => _.length === origArr[0].length)

  // if there is only one shortest classification, return that item
  if (shortestResults.length === 1) {
    const itemFound = candidateItems.filter(_ => _.id === shortestResults[0][0].id.toString().slice(5))
    return itemFound[0]
  }

  // If there are multiple items, we need to find one that has the most similar disambiguation items
  // this is done by finding which item has the largest overlap of conceptId:value
  const itemDisambiguationArray = item.disambiguationAttributes.map(_ => `${_.conceptId}:${_.value}`)
  const candidateDisambiguation = shortestResults
    .map(_ => candidateItems
      .find(i => i.id === _[0].id.toString().slice(5)) as ItemDefinition)
    .map(_ => ({ id: _.id, attributes: _.disambiguationAttributes
      .map(attr => `${attr.conceptId}:${attr.value}`)
    }))

  const similarityResults = candidateDisambiguation.map(_ => {
    return {
      candidateItem: _.id,
      overlap: intersect(itemDisambiguationArray, _.attributes)
    }
  }).sort((a, b) => b.overlap.length - a.overlap.length)

  if (!similarityResults[0]) {
    return null
  }

  const result = candidateItems.find(_ => _.id === similarityResults[0].candidateItem) || null

  return result
}

export const findClassificationLinks = (graph: Graph, fromItem: ItemDefinition, toItem: ItemDefinition): GraphNode[] => {
  const pathFinder = path.aStar(graph)
  return pathFinder.find(itemId(fromItem.id), itemId(toItem.id))
}
