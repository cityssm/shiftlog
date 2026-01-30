import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoReopenWorkOrderResponse } from '../../handlers/workOrders-post/doReopenWorkOrder.js'

import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const shiftLog = exports.shiftLog

  const workOrderTabsContainerElement = document.querySelector(
    '#container--workOrderTabs'
  )

  if (workOrderTabsContainerElement !== null) {
    shiftLog.initializeRecordTabs(workOrderTabsContainerElement as HTMLElement)
  }

  /*
   * Reopen work order
   */
  const reopenWorkOrderButton = document.querySelector(
    '#button--reopenWorkOrder'
  ) as HTMLButtonElement | null

  if (reopenWorkOrderButton !== null) {
    reopenWorkOrderButton.addEventListener('click', () => {
      bulmaJS.confirm({
        contextualColorName: 'warning',
        message:
          'Are you sure you want to reopen this work order? This will clear the close date.',
        okButton: {
          callbackFunction: () => {
            const workOrderIdElement = document.querySelector(
              '#workOrder--workOrderId'
            ) as HTMLInputElement

            cityssm.postJSON(
              `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doReopenWorkOrder`,
              {
                workOrderId: workOrderIdElement.value
              },
              (responseJSON: DoReopenWorkOrderResponse) => {
                if (responseJSON.success) {
                  globalThis.location.href = responseJSON.redirectUrl
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Reopen Error',
                    
                    message: responseJSON.errorMessage
                  })
                }
              }
            )
          },
          text: 'Reopen Work Order'
        },
        title: 'Reopen Work Order'
      })
    })
  }
})()
