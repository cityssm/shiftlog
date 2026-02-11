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

    // Update Edit button href to preserve the selected tab
    const editButtonLink = document.querySelector(
      'a.button[href$="/edit"]'
    ) as HTMLAnchorElement | null

    if (editButtonLink !== null) {
      const menuTabLinks =
        workOrderTabsContainerElement.querySelectorAll('.menu a')

      // Set initial hash on Edit button based on currently active tab
      const activeTabLink = workOrderTabsContainerElement.querySelector(
        '.menu a.is-active'
      ) as HTMLAnchorElement | null

      if (activeTabLink !== null) {
        const tabHash = activeTabLink.getAttribute('href') ?? ''
        const baseHref = editButtonLink.href.split('#')[0]
        editButtonLink.href = baseHref + tabHash
      }

      // Update Edit button href when tabs are clicked
      for (const menuTabLink of menuTabLinks) {
        menuTabLink.addEventListener('click', (clickEvent) => {
          const target = clickEvent.currentTarget as HTMLAnchorElement
          const tabHash = target.getAttribute('href') ?? ''

          // Update the Edit button href to include the selected tab hash
          const baseHref = editButtonLink.href.split('#')[0]
          editButtonLink.href = baseHref + tabHash
        })
      }
    }
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
