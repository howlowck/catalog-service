import fs from 'fs'
import { CatalogSchema } from 'common-catalog-schema'

const content = fs.readFileSync('data/chinese-restaurant.catalog.json', 'utf8')

const rawData: CatalogSchema = JSON.parse(content)

const data = {
  ...rawData,
  items: rawData.items.map(item => {
    return {
      ...item,
      // tslint:disable-next-line: no-unnecessary-type-assertion
      disambiguationAttributes: item.disambiguationAttributes!.map(attr => ({
        ...attr,
        value: attr.value.toString().toLowerCase()
      }))
    }
  }),
  concepts: rawData.concepts.map(concept => {
    return {
      ...concept,
      values: concept.values!.map(value => ({
        ...value,
        value: value.value.toLowerCase()
      }))
    }
  })
}

export default data
