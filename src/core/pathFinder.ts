import path from 'ngraph.path'
// import data from './data'
import { CatalogSchema } from 'common-catalog-schema'
import graphBuilder from './graphBuilder'

const graph = (data: CatalogSchema) => graphBuilder()(data)
let pathFinder = (data: CatalogSchema) => path.aStar(graph(data))

export default pathFinder
