import fs from 'fs'
import { CatalogSchema } from 'common-catalog-schema'

const content = fs.readFileSync('data/chinese-restaurant.catalog.json', 'utf8')

const data: CatalogSchema = JSON.parse(content)

export default data
