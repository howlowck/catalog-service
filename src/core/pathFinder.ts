import path from 'ngraph.path'
import graph, { conceptId, classId } from './graph'

let pathFinder = path.aStar(graph)

export default pathFinder
