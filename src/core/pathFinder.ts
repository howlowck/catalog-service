import path from 'ngraph.path'
import data from './data'
import graphBuilder from './graphBuilder'

const graph = graphBuilder()(data)
let pathFinder = path.aStar(graph)

export default pathFinder
