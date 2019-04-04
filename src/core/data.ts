import dataParser from './dataParser'
import { CatalogSchema } from 'common-catalog-schema'

export default dataParser('data/coffee-shop.catalog.json') as CatalogSchema
