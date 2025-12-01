import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
}

declare const cityssm: {
  postJSON: (
    url: string,
    data: unknown,
    callback: (responseJSON: unknown) => void
  ) => void
}

declare const bulmaJS: {
  confirm: (options: {
    contextualColorName: string
    title: string
    message: string
    okButton: {
      text: string
      callbackFunction: () => void
    }
  }) => void
  alert: (options: {
    contextualColorName: string
    message?: string
    title?: string
  }) => void
}
;(() => {
  const shiftLog = exports.shiftLog

  const workOrderTabsContainerElement = document.querySelector(
    '#container--workOrderTabs'
  )

  if (workOrderTabsContainerElement !== null) {
    shiftLog.initializeRecordTabs(
      workOrderTabsContainerElement as HTMLElement
    )
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
        title: 'Reopen Work Order',
        message:
          'Are you sure you want to reopen this work order? This will clear the close date.',
        okButton: {
          text: 'Reopen Work Order',
          callbackFunction: () => {
            const workOrderIdElement = document.querySelector(
              '#workOrder--workOrderId'
            ) as HTMLInputElement

            cityssm.postJSON(
              `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doReopenWorkOrder`,
              {
                workOrderId: workOrderIdElement.value
              },
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  redirectUrl?: string
                  errorMessage?: string
                }

                if (
                  responseJSON.success &&
                  responseJSON.redirectUrl !== undefined
                ) {
                  globalThis.location.href = responseJSON.redirectUrl
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Reopen Error',
                    message:
                      responseJSON.errorMessage ?? 'An unknown error occurred.'
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
