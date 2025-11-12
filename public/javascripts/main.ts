import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog?: ShiftLogGlobal
}
;(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

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
   * Declare sunrise
   */

  const shiftLog: ShiftLogGlobal = {
    apiKey: document.querySelector('main')?.dataset.apiKey ?? '',
    urlPrefix,

    clearUnsavedChanges,
    hasUnsavedChanges,
    setUnsavedChanges
  }

  exports.shiftLog = shiftLog
})()
