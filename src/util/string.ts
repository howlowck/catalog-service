import { ConceptValue } from '../types/search'
import { SchemaType } from '../types/generic'

export const convertSearchPairingToConceptValue = (name: string): ConceptValue => {
  const pairing: string[] = name.split(':')

  if (pairing.length !== 2) {
    throw new Error(`the value you supplied does not look like a concept value pairing: ${name}`)
  }

  return {
    conceptId: pairing[0],
    key: pairing[1]
  }
}

export const graphId = (type: string, id: string) => {
  return type + ':' + id
}

export const classId: (id: string) => string = graphId.bind(null, SchemaType.classification)
export const conceptId: (id: string) => string = graphId.bind(null, SchemaType.concept)
export const itemId: (id: string) => string = graphId.bind(null, SchemaType.item)
