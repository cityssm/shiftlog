import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type FlatPickr from 'flatpickr'

import type { DoCreateShiftResponse } from '../../handlers/shifts-post/doCreateShift.js'
import type { DoDeleteShiftResponse } from '../../handlers/shifts-post/doDeleteShift.js'
import type { DoUpdateShiftResponse } from '../../handlers/shifts-post/doUpdateShift.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const flatpickr: typeof FlatPickr

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog

  // Clear URL hash in edit mode to ensure page loads at top
  if (globalThis.location.hash !== '') {
    globalThis.history.replaceState(
      null,
      '',
      globalThis.location.pathname + globalThis.location.search
    )
    // Scroll to top after clearing hash
    globalThis.scrollTo(0, 0)
  }

  const shiftUrlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`

  const shiftFormElement = document.querySelector(
    '#form--shift'
  ) as HTMLFormElement

  const shiftId = (
    shiftFormElement.querySelector('#shift--shiftId') as HTMLInputElement
  ).value

  const isCreate = shiftId === ''

  /*
   * Set up date picker
   */

  const shiftDateStringElement = shiftFormElement.querySelector(
    '#shift--shiftDateString'
  ) as HTMLInputElement | null

  if (shiftDateStringElement !== null) {
    flatpickr(shiftDateStringElement, {
      allowInput: true,
      dateFormat: 'Y-m-d',

      nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
      prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
    })
  }

  function updateShift(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${shiftUrlPrefix}/${isCreate ? 'doCreateShift' : 'doUpdateShift'}`,
      shiftFormElement,
      (responseJSON: DoCreateShiftResponse | DoUpdateShiftResponse) => {
        if (responseJSON.success) {
          if (isCreate && 'shiftId' in responseJSON) {
            globalThis.location.href = shiftLog.buildShiftURL(
              responseJSON.shiftId,
              true
            )
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

            message: 'An unknown error occurred.'
          })
        }
      }
    )
  }

  shiftFormElement.addEventListener('submit', updateShift)

  /*
   * Delete shift
   */

  const deleteShiftButton = document.querySelector(
    '#button--deleteShift'
  ) as HTMLAnchorElement | null

  if (deleteShiftButton !== null) {
    deleteShiftButton.addEventListener('click', (event) => {
      event.preventDefault()

      bulmaJS.confirm({
        contextualColorName: 'danger',
        title: 'Delete Shift',

        message:
          'Are you sure you want to delete this shift? This action cannot be undone.',
        okButton: {
          text: 'Delete Shift',

          callbackFunction: () => {
            cityssm.postJSON(
              `${shiftUrlPrefix}/doDeleteShift`,
              {
                shiftId
              },
              (responseJSON: DoDeleteShiftResponse) => {
                if (responseJSON.success) {
                  globalThis.location.href = responseJSON.redirectUrl
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Delete Error',

                    message: responseJSON.errorMessage
                  })
                }
              }
            )
          }
        }
      })
    })
  }
})()
