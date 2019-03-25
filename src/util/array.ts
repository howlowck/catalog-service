export const flatSingle = <T>(array: T[][]): T[] => ([] as T[]).concat(...array)

export const intersect = <T>(array1: T[], array2: T[]) => array1.filter(value => array2.includes(value))
