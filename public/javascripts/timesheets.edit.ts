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

  async function doSaveTimesheet(
    formEvent: SubmitEvent
  ): Promise<void> {
    formEvent.preventDefault()

    const formData = new FormData(formElement)
    const timesheetData: Record<string, string> = {}

    for (const [key, value] of formData.entries()) {
      timesheetData[key] = value.toString()
    }

    try {
      const endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet'

      const response = await fetch(
        `${urlPrefix}/${timesheetRouter}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(timesheetData)
        }
      )

      const result = await response.json()

      if (result.success) {
        if (isCreate) {
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
    } catch {
      cityssm.alertModal(
        'Error',
        'An error occurred while saving the timesheet.',
        'error'
      )
    }
  }

  formElement.addEventListener('submit', doSaveTimesheet)
})()
