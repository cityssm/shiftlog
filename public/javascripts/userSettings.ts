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

  /*
   * API Key
   */

  function doResetApiKey(): void {
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/dashboard/doResetApiKey`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          apiKey?: string
          success: boolean
        }

        if (responseJSON.success) {
          bulmaJS.alert({
            contextualColorName: 'success',
            title: 'API Key Reset Successfully',

            message: 'Remember to update any applications using your API key.'
          })
        }
      }
    )
  }

  document
    .querySelector('#button--resetApiKey')
    ?.addEventListener('click', (event) => {
      event.preventDefault()

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Reset API Key',

        message: 'Are you sure you want to reset your API key?',

        okButton: {
          callbackFunction: doResetApiKey,
          text: 'Yes, Reset My API Key'
        }
      })
    })
})()
