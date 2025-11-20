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

  const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.workOrdersRouter

  const workOrderFormElement = document.querySelector(
    '#form--workOrder'
  ) as HTMLFormElement

  const workOrderId = (
    workOrderFormElement.querySelector('#workOrder--workOrderId') as HTMLInputElement
  ).value

  const isCreate = workOrderId === ''

  function updateWorkOrder(formEvent: Event): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${urlPrefix}/${isCreate ? 'doCreateWorkOrder' : 'doUpdateWorkOrder'}`,
      workOrderFormElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          workOrderId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          if (isCreate && responseJSON.workOrderId !== undefined) {
            globalThis.location.href = `${urlPrefix}/${responseJSON.workOrderId.toString()}`
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

  workOrderFormElement.addEventListener('submit', updateWorkOrder)
})()
