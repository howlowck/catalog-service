import { ItemDefinition } from 'common-catalog-schema'
import { SchemaType } from './generic'

export interface Query {
  [key: string]: string
}

export interface DisambiguationResult {
  conceptId: string,
  associatedItems: AssociatedItem[]
}

export interface AssociatedItem {
  conceptValue: string,
  itemId: string
}

export interface LabelResult {
  type: SchemaType,
  value: string,
  score: number
}

export interface LabelSearchResult {
  label: string,
  results: LabelResult[]
}

export enum SearchResultType {
  directMatchSingleItem = 'directMatchSingleItem',
  inferredSingleItem = 'inferredSingleItem',
  needDisambiguation = 'needDisambiguation'
}

export interface SearchResult {
  itemFound: boolean,
  type: SearchResultType
}

export interface SearchResponse {
  input: string[],
  // disambiguation: DisambiguationResult[],
  labelSearchResults: LabelSearchResult[],
  // searchResult: SearchResult,
  itemClassificationHeuristics: {
    label: string,
    classifications: {
      classificationId: string,
      result: {
        conceptId: string,
        key: string,
        itemsFound: string[]
      }[]
    }[]
  }[]
}
