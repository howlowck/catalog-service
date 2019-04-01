import { SchemaType } from './generic'

export interface LinkData {
  fromType: SchemaType,
  toType: SchemaType,
  value?: string | number | boolean | {[key: string]: string | number | boolean}
}

type NodeId = string | number

export interface GraphNode {
  id: NodeId,
  links: GraphLink[],
  data: {[key: string]: any}
}

export interface GraphLink {
  fromId: NodeId,
  toId: NodeId,
  id: string
}
