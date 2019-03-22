import { ItemDefinition } from "common-catalog-schema";

export interface Query {
  [key: string]: string
}

export interface SearchResponse {
  item: ItemDefinition | null,
}
