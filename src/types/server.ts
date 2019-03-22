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

export interface LabelDetailObj {
  [labelText: string]: LabelResult[]
}

export interface SearchResponse {
  input: string[],
  disambiguation: DisambiguationResult[],
  labelDetail: LabelDetailObj,
  matchingItems: []
}
