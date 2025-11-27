export interface ReportDefinition {
  parameterNames: string[]
  sql: string
}

export type ReportParameters = Record<string, number | string>