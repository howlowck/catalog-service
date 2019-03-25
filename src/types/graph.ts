import { SchemaType } from './generic'

export interface LinkData {
  fromType: SchemaType,
  toType: SchemaType,
  value?: string | number | boolean | {[key: string]: string | number | boolean}
}
