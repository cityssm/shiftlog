export interface ShiftLogGlobal {
  apiKey: string
  urlPrefix: string

  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean
  setUnsavedChanges: () => void
}
