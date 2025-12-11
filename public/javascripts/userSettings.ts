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
   * Employee Contact Information
   */

  const employeeContactForm = document.querySelector('#employeeContactForm')

  if (employeeContactForm !== null) {
    employeeContactForm.addEventListener('submit', (formEvent) => {
      formEvent.preventDefault()

      const formElement = formEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/dashboard/doUpdateEmployeeContact`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
          }

          if (responseJSON.success) {
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Contact Information Updated',
              message: 'Your contact information has been updated successfully.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error',
              message: 'There was an error updating your contact information.'
            })
          }
        }
      )
    })
  }

  /*
   * User Settings
   */

  const userSettingForms = document.querySelectorAll('.userSettingForm')

  for (const userSettingForm of userSettingForms) {
    userSettingForm.addEventListener('submit', (formEvent) => {
      formEvent.preventDefault()

      const formElement = formEvent.currentTarget as HTMLFormElement

      const formData = new FormData(formElement)

      const settingKey = formData.get('settingKey') as string
      const settingValue = formData.get('settingValue') as string

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/dashboard/doUpdateUserSetting`,
        {
          settingKey,
          settingValue
        },
        (responseJSON: { success: boolean }) => {
          if (responseJSON.success) {
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'User Setting Updated',
              message: 'Your user setting has been updated successfully.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error',
              message: 'There was an error updating your user setting.'
            })
          }
        }
      )
    })
  }

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
