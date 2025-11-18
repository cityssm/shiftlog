// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

declare const cityssm: cityssmGlobal
;(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''
  const timesheetRouter =
    document.querySelector('main')?.dataset.timesheetRouter ?? ''

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
      `${urlPrefix}/${timesheetRouter}/${endpoint}`,
      formElement,
      (rawResponseJSON) => {
        const result = rawResponseJSON as {
          success: boolean
          timesheetId?: number
          redirectURL?: string
        }

        if (result.success) {
          if (isCreate && result.redirectURL) {
            window.location.href = result.redirectURL
          } else {
            cityssm.alertModal(
              'Success',
              'Timesheet updated successfully.',
              'success',
              () => {
                window.location.reload()
              }
            )
          }
        } else {
          cityssm.alertModal(
            'Error',
            'An error occurred while saving the timesheet.',
            'error'
          )
        }
      }
    )
  }

  formElement.addEventListener('submit', doSaveTimesheet)
})()
