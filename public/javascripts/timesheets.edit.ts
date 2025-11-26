import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog

  const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.timesheetsRouter}`

  const formElement = document.querySelector(
    '#form--timesheet'
  ) as HTMLFormElement

  const timesheetIdElement = formElement.querySelector(
    '#timesheet--timesheetId'
  ) as HTMLInputElement

  const isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1'

  function doSaveTimesheet(
    formEvent: SubmitEvent
  ): void {
    formEvent.preventDefault()

    const endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet'

    cityssm.postJSON(
      `${urlPrefix}/${endpoint}`,
      formElement,
      (rawResponseJSON) => {
        const result = rawResponseJSON as {
          success: boolean
          timesheetId?: number
        }

        if (result.success) {
          if (isCreate) {
            globalThis.location.href = `${urlPrefix}/${result.timesheetId ?? ''}/edit`
          } else {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Timesheet updated successfully.'
            })
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'An error occurred while saving the timesheet.'
          })
        }
      }
    )
  }

  formElement.addEventListener('submit', doSaveTimesheet)
})()
