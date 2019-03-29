import { ConceptValue } from '../types/search'

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
