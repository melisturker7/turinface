export interface DataPoint {
  ID: number
  GlideNumber: string
  Country: string
  multi_country: string
  anonymous_long: number
  anonymous_lat: number
  Area: number
  Began: number
  Ended: number
  Validation: string
  Dead: number
  Displaced: number
  MainCause: string
  Severity: number
  categorised_cause: string
}

export interface ParsedData {
  headers: string[]
  rows: DataPoint[]
}
