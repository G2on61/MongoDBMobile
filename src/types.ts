export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject
export interface JsonObject {
  [key: string]: JsonValue
}

export interface ConnectionInfo {
  id: string
  name: string
  kind: 'demo' | 'gateway'
}

export interface QueryInput {
  filter: string
  sort: string
  limit: number
  skip: number
}

export interface DocumentPage {
  documents: JsonObject[]
  total: number
  skip: number
  limit: number
}

export interface MongoRepository {
  listDatabases(): Promise<string[]>
  listCollections(database: string): Promise<string[]>
  findDocuments(
    database: string,
    collection: string,
    query: QueryInput,
  ): Promise<DocumentPage>
}

export interface QueryEntry {
  id: string
  connectionId: string
  database: string
  collection: string
  query: QueryInput
  createdAt: number
}

export interface SavedQuery extends QueryEntry {
  name: string
}
