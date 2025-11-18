import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: Partial<ShiftLogGlobal>
}
;(() => {
  /*
   * Unsaved Changes
   */

  let _hasUnsavedChanges = false

  function setUnsavedChanges(): void {
    if (!hasUnsavedChanges()) {
      _hasUnsavedChanges = true
      cityssm.enableNavBlocker()
    }
  }

  function clearUnsavedChanges(): void {
    _hasUnsavedChanges = false
    cityssm.disableNavBlocker()
  }

  function hasUnsavedChanges(): boolean {
    return _hasUnsavedChanges
  }

  /*
   * URL builders
   */

  function buildShiftURL(shiftId: number): string {
    return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.shiftsRouter}/${shiftId.toString()}`
  } 
  
  function buildTimesheetURL(timesheetId: number): string {
    return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.timesheetsRouter}/${timesheetId.toString()}`
  }

  /*
   * Declare shiftLog
   */

  exports.shiftLog = {
    ...exports.shiftLog,

    clearUnsavedChanges,
    hasUnsavedChanges,
    setUnsavedChanges,

    buildShiftURL,
    buildTimesheetURL
  }
})()
