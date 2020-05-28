import { CatalogSchema } from 'common-catalog-schema'
import { MakeSearchOutput } from './search'

export enum SchemaType {
  classification = 'classification',
  concept = 'concept',
  item = 'item'
}

export type DataStore = {
  [key: string]: {
    data: CatalogSchema,
    classificationSearch: MakeSearchOutput<string>,
    conceptSearch: MakeSearchOutput<string>,
    itemSearch: MakeSearchOutput<string>,
    conceptValueSearch: MakeSearchOutput<string>
  }
}
