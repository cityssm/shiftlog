export interface ShiftLogGlobal {
  apiKey: string
  sessionKeepAliveMillis: number
  urlPrefix: string

  shiftsAreEnabled: boolean
  shiftsRouter: string
  shiftsSectionName: string
  shiftsSectionNameSingular: string

  buildShiftURL: (shiftId: number) => string

  workOrdersAreEnabled: boolean
  workOrdersRouter: string
  workOrdersSectionName: string
  workOrdersSectionNameSingular: string

  timesheetsAreEnabled: boolean
  timesheetsRouter: string
  timesheetsSectionName: string
  timesheetsSectionNameSingular: string
  
  isAdmin: boolean

  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean
  setUnsavedChanges: () => void
}
