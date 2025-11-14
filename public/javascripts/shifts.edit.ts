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

  const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.shiftsRouter

  const shiftFormElement = document.querySelector(
    '#form--shift'
  ) as HTMLFormElement

  const shiftId = (
    shiftFormElement.querySelector('#shift--shiftId') as HTMLInputElement
  ).value

  const isCreate = shiftId === ''

  function updateShift(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${urlPrefix}/${isCreate ? 'doCreateShift' : 'doUpdateShift'}`,
      shiftFormElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          shiftId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          if (isCreate && responseJSON.shiftId !== undefined) {
            globalThis.location.href = `${urlPrefix}/${responseJSON.shiftId.toString()}`
          } else {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Updated Successfully'
            })
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Update Error',

            message: responseJSON.errorMessage ?? 'An unknown error occurred.'
          })
        }
      }
    )
  }

  shiftFormElement.addEventListener('submit', updateShift)
})()
