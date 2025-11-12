export interface ShiftLogGlobal {
  apiKey: string
  sessionKeepAliveMillis: number
  urlPrefix: string

  shiftsAreEnabled: boolean
  shiftsRouter: string

  workOrdersAreEnabled: boolean
  workOrdersRouter: string

  timesheetsAreEnabled: boolean
  timesheetsRouter: string
  
  isAdmin: boolean

  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean
  setUnsavedChanges: () => void
}
