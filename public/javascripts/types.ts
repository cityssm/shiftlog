export interface ShiftLogGlobal {
  apiKey: string
  sessionKeepAliveMillis: number
  urlPrefix: string

  shiftsAreEnabled: boolean
  shiftsRouter: string
  shiftsSectionName: string
  shiftsSectionNameSingular: string

  buildShiftURL: (shiftId: number, edit?: boolean) => string

  workOrdersAreEnabled: boolean
  workOrdersRouter: string
  workOrdersSectionName: string
  workOrdersSectionNameSingular: string

  buildWorkOrderURL: (workOrderId: number, edit?: boolean) => string

  timesheetsAreEnabled: boolean
  timesheetsRouter: string
  timesheetsSectionName: string
  timesheetsSectionNameSingular: string

  buildTimesheetURL: (timesheetId: number, edit?: boolean) => string
  
  isAdmin: boolean

  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean
  setUnsavedChanges: () => void

  initializeRecordTabs: (tabsContainerElement: HTMLElement) => void
}
