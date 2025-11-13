import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
    shiftLog: ShiftLogGlobal
  }

  /*
   * LOGOUT MODAL
   */
;(() => {
  function doLogout(): void {
    globalThis.localStorage.clear()
    globalThis.location.href = `${exports.shiftLog.urlPrefix}/logout`
  }

  document
    .querySelector('#cityssm-theme--logout-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Log Out?',

        message: 'Are you sure you want to log out?',

        okButton: {
          callbackFunction: doLogout,
          text: 'Log Out'
        }
      })
    })
})()

/*
 * KEEP ALIVE
 */
;(() => {
  const keepAliveMillis = exports.shiftLog.sessionKeepAliveMillis

  let keepAliveInterval: NodeJS.Timeout | undefined

  function doKeepAlive(): void {
    cityssm.postJSON(
      `${exports.shiftLog.urlPrefix}/keepAlive`,
      {
        t: Date.now()
      },
      (rawResponseJson: unknown) => {
        const responseJson = rawResponseJson as {
          activeSession: boolean
        }

        if (!responseJson.activeSession) {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Session Expired',

            message: 'Your session has expired. Please log in again.',

            okButton: {
              callbackFunction: () => {
                globalThis.location.reload()
              },
              text: 'Refresh Page'
            }
          })

          globalThis.clearInterval(keepAliveInterval)
        }
      }
    )
  }

  if (keepAliveMillis !== 0) {
    keepAliveInterval = globalThis.setInterval(doKeepAlive, keepAliveMillis)
  }
})()
