import dataParser from './dataParser'
import { CatalogSchema } from 'common-catalog-schema'
import fs from 'fs'
import { makeClassificationSearch, makeItemSearch, makeConceptSearch, makeConceptValueSearch } from './search'
import { DataStore } from '../types/generic'

const files = fs.readdirSync('./data')
const catalogFiles = files.filter(_ => _.slice(-12) === 'catalog.json')
const store: DataStore = catalogFiles.reduce((prev, curr) => {
  const fileName = curr
  const keyName = fileName.slice(0, -13) // removes '.catalog.json'
  const data = dataParser(`data/${fileName}`) as CatalogSchema
  return {
    ...prev,
    [keyName]: {
      data,
      classificationSearch: makeClassificationSearch(data),
      conceptSearch: makeConceptSearch(data),
      itemSearch: makeItemSearch(data),
      conceptValueSearch: makeConceptValueSearch(data)
    }
  }
}, {})

export default store
