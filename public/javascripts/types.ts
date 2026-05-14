export type ShiftLogUnsavedChangeTracker = '' | 'modal'

export interface ShiftLogGlobal {
  daysOfWeek: string[]

  apiKey: string
  sessionKeepAliveMillis: number
  urlPrefix: string

  defaultCityProvince: string
  defaultLatitude: number
  defaultLongitude: number

  shiftsAreEnabled: boolean
  shiftsRouter: string
  shiftsSectionName: string
  shiftsSectionNameSingular: string

  buildShiftURL: (shiftId: number, edit?: boolean) => string

  workOrdersAreEnabled: boolean
  workOrdersIconClass: string
  workOrdersRouter: string
  workOrdersSectionName: string
  workOrdersSectionNameSingular: string

  userCanManageWorkOrders: boolean
  userCanUpdateWorkOrders: boolean

  buildWorkOrderURL: (workOrderId: number, edit?: boolean) => string

  timesheetsAreEnabled: boolean
  timesheetsRouter: string
  timesheetsSectionName: string
  timesheetsSectionNameSingular: string

  equipmentIconClass: string
  equipmentSectionName: string
  equipmentSectionNameSingular: string

  buildTimesheetURL: (timesheetId: number, edit?: boolean) => string

  emailAddress: string
  isAdmin: boolean
  userName: string

  clearUnsavedChanges: (changeTracker?: ShiftLogUnsavedChangeTracker) => void
  hasUnsavedChanges: (changeTracker?: ShiftLogUnsavedChangeTracker) => boolean
  setUnsavedChanges: (changeTracker?: ShiftLogUnsavedChangeTracker) => void

  initializeRecordTabs: (tabsContainerElement: HTMLElement) => void

  initializeMarkdownTextarea: (
    textareaElement: HTMLTextAreaElement,
    options?: { showMarkdownTab?: boolean }
  ) => void

  buildPaginationControls: (options: {
    totalCount: number
    currentPageOrOffset: number
    itemsPerPageOrLimit: number
    clickHandler: (pageNumber: number) => void
  }) => HTMLElement

  populateSectionAliases: (containerElement?: HTMLElement) => void
}
