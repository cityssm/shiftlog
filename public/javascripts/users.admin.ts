// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DatabaseUser } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal

  domain: string
  users: DatabaseUser[]

  userSettingKeys: readonly string[]
}
;(() => {
  const shiftLog = exports.shiftLog

  const usersContainerElement = document.querySelector(
    '#container--users'
  ) as HTMLElement

  function deleteUser(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const userName = buttonElement.dataset.userName

    if (userName === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete User',

      message: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,

      okButton: {
        contextualColorName: 'warning',
        text: 'Delete User',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteUser`,
            {
              userName
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                message?: string
                success: boolean

                users?: DatabaseUser[]
              }

              if (responseJSON.success) {
                // Update the users list with the new data from the server
                if (responseJSON.users !== undefined) {
                  renderUsers(responseJSON.users)
                }

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'User Deleted',

                  message: 'User has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting User',

                  message: responseJSON.message ?? 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function toggleUserPermission(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const userName = buttonElement.dataset.userName
    const permission = buttonElement.dataset.permission

    if (userName === undefined || permission === undefined) {
      return
    }

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/admin/doToggleUserPermission`,
      {
        permissionField: permission,
        userName
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          message?: string
          success: boolean

          users: DatabaseUser[]
        }

        if (responseJSON.success) {
          renderUsers(responseJSON.users)
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Permission',

            message: responseJSON.message ?? 'Please try again.'
          })
        }
      }
    )
  }

  function editUserSettings(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const userName = buttonElement.dataset.userName

    if (userName === undefined) {
      return
    }

    // Find the user in the current users list
    const user = exports.users.find((u) => u.userName === userName)

    if (user === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateUserSettings(submitEvent: Event): void {
      submitEvent.preventDefault()

      const settingsForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateUserSettings`,
        settingsForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            message?: string
            success: boolean
            users?: DatabaseUser[]
          }

          if (responseJSON.success) {
            closeModalFunction()

            // Update the users list with the new data from the server
            if (responseJSON.users !== undefined) {
              exports.users = responseJSON.users
              renderUsers(responseJSON.users)
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Settings Updated',

              message: 'User settings have been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Settings',

              message: responseJSON.message ?? 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminUsers-settings', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector('#span--userName') as HTMLSpanElement
        ).textContent = userName

        // Set hidden userName field
        ;(
          modalElement.querySelector('[name="userName"]') as HTMLInputElement
        ).value = userName

        // Pre-populate settings fields
        const settings = user.userSettings ?? {}

        // Dynamically generate form fields for all user settings
        const containerElement = modalElement.querySelector(
          '#container--userSettings'
        ) as HTMLElement
        containerElement.innerHTML = ''

        for (const settingKey of exports.userSettingKeys) {
          const fieldElement = document.createElement('div')
          fieldElement.className = 'field'

          const isApiKey = settingKey === 'apiKey'
          const settingValue = settings[settingKey] ?? ''

          // eslint-disable-next-line no-unsanitized/property
          fieldElement.innerHTML = /* html */ `
            <label class="label" for="${cityssm.escapeHTML(settingKey)}">
              ${cityssm.escapeHTML(settingKey)}
            </label>
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  id="${cityssm.escapeHTML(settingKey)}"
                  name="${cityssm.escapeHTML(settingKey)}"
                  type="text"
                  value="${cityssm.escapeHTML(settingValue)}"
                  ${isApiKey ? 'readonly' : ''}
                />
              </div>
              ${
                isApiKey
                  ? `<div class="control">
                      <button
                        class="button is-warning"
                        id="button--resetApiKey"
                        type="button"
                        title="Reset API Key"
                      >
                        <span class="icon">
                          <i class="fa-solid fa-rotate"></i>
                        </span>
                        <span>Reset</span>
                      </button>
                    </div>`
                  : ''
              }
            </div>
          `

          containerElement.append(fieldElement)
        }

        // Add event listener for reset API key button
        const resetApiKeyButton = modalElement.querySelector(
          '#button--resetApiKey'
        ) as HTMLButtonElement | null

        if (resetApiKeyButton !== null) {
          resetApiKeyButton.addEventListener('click', () => {
            bulmaJS.confirm({
              contextualColorName: 'warning',
              title: 'Reset API Key',
              message: `Are you sure you want to reset the API key for user "${userName}"? The old key will no longer work.`,
              okButton: {
                contextualColorName: 'warning',
                text: 'Reset API Key',
                callbackFunction() {
                  resetUserApiKey(userName)
                }
              }
            })
          })
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateUserSettings)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function resetUserApiKey(userName: string): void {
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/admin/doResetUserApiKey`,
      {
        userName
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          message?: string
          success: boolean
          users?: DatabaseUser[]
          apiKey?: string
        }

        if (responseJSON.success) {
          // Update the users list with the new data from the server
          if (responseJSON.users !== undefined) {
            exports.users = responseJSON.users
            renderUsers(responseJSON.users)
          }

          bulmaJS.alert({
            contextualColorName: 'success',
            title: 'API Key Reset',
            message: `API key has been successfully reset.${responseJSON.apiKey !== undefined ? `<br><strong>New API Key:</strong> ${cityssm.escapeHTML(responseJSON.apiKey)}` : ''}`
          })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Resetting API Key',
            message: responseJSON.message ?? 'Please try again.'
          })
        }
      }
    )
  }

  const activePermissionClass = 'is-success'
  const inactivePermissionClass = 'is-light'

  function buildUserRowElement(user: DatabaseUser): HTMLTableRowElement {
    const rowElement = document.createElement('tr')
    rowElement.dataset.userName = user.userName

    // eslint-disable-next-line no-unsanitized/property
    rowElement.innerHTML = /* html */ `
      <th>${cityssm.escapeHTML(user.userName)}</th>
      <td class="has-text-centered has-border-left">
        <button
          class="button is-small permission-toggle ${user.isActive ? activePermissionClass : inactivePermissionClass}"
          data-permission="isActive"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Active Status"
        >
          ${user.isActive ? 'Yes' : 'No'}
        </button>
      </td>
    `

    if (shiftLog.shiftsAreEnabled) {
      // eslint-disable-next-line no-unsanitized/method
      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td class="has-text-centered has-border-left">
            <button
              class="button is-small permission-toggle ${user.shifts_canView ? activePermissionClass : inactivePermissionClass}"
              data-permission="shifts_canView"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.shiftsSectionName)} Can View"
            >
              <i class="fa-solid fa-${user.shifts_canView ? 'check' : 'times'}"></i>
            </button>
          </td>
          <td class="has-text-centered">
            <button
              class="button is-small permission-toggle ${user.shifts_canUpdate ? activePermissionClass : inactivePermissionClass}"
              data-permission="shifts_canUpdate"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.shiftsSectionName)} Can Update"
            >
              <i class="fa-solid fa-${user.shifts_canUpdate ? 'check' : 'times'}"></i>
            </button>
          </td>
          <td class="has-text-centered">
            <button
              class="button is-small permission-toggle ${user.shifts_canManage ? activePermissionClass : inactivePermissionClass}"
              data-permission="shifts_canManage"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.shiftsSectionName)} Can Manage"
            >
              <i class="fa-solid fa-${user.shifts_canManage ? 'check' : 'times'}"></i>
            </button>
          </td>
        `
      )
    }

    if (shiftLog.workOrdersAreEnabled) {
      // eslint-disable-next-line no-unsanitized/method
      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td class="has-text-centered has-border-left">
            <button
              class="button is-small permission-toggle ${user.workOrders_canView ? activePermissionClass : inactivePermissionClass}"
              data-permission="workOrders_canView"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.workOrdersSectionName)} Can View"
            >
              <i class="fa-solid fa-${user.workOrders_canView ? 'check' : 'times'}"></i>
            </button>
          </td>
          <td class="has-text-centered">
            <button
              class="button is-small permission-toggle ${user.workOrders_canUpdate ? activePermissionClass : inactivePermissionClass}"
              data-permission="workOrders_canUpdate"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.workOrdersSectionName)} Can Update"
            >
              <i class="fa-solid fa-${user.workOrders_canUpdate ? 'check' : 'times'}"></i>
            </button>
          </td>
          <td class="has-text-centered">
            <button
              class="button is-small permission-toggle ${user.workOrders_canManage ? activePermissionClass : inactivePermissionClass}"
              data-permission="workOrders_canManage"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.workOrdersSectionName)} Can Manage"
            >
              <i class="fa-solid fa-${user.workOrders_canManage ? 'check' : 'times'}"></i>
            </button>
          </td>
        `
      )
    }

    if (shiftLog.timesheetsAreEnabled) {
      // eslint-disable-next-line no-unsanitized/method
      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td class="has-text-centered has-border-left">
            <button
              class="button is-small permission-toggle ${user.timesheets_canView ? activePermissionClass : inactivePermissionClass}"
              data-permission="timesheets_canView"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.timesheetsSectionName)} Can View"
            >
              <i class="fa-solid fa-${user.timesheets_canView ? 'check' : 'times'}"></i>
            </button>
          </td>
          <td class="has-text-centered">
            <button
              class="button is-small permission-toggle ${user.timesheets_canUpdate ? activePermissionClass : inactivePermissionClass}"
              data-permission="timesheets_canUpdate"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.timesheetsSectionName)} Can Update"
            >
              <i class="fa-solid fa-${user.timesheets_canUpdate ? 'check' : 'times'}"></i>
            </button>
          </td>
          <td class="has-text-centered">
            <button
              class="button is-small permission-toggle ${user.timesheets_canManage ? activePermissionClass : inactivePermissionClass}"
              data-permission="timesheets_canManage"
              data-user-name="${cityssm.escapeHTML(user.userName)}"
              title="Toggle ${cityssm.escapeHTML(shiftLog.timesheetsSectionName)} Can Manage"
            >
              <i class="fa-solid fa-${user.timesheets_canManage ? 'check' : 'times'}"></i>
            </button>
          </td>
        `
      )
    }

    // eslint-disable-next-line no-unsanitized/property
    rowElement.innerHTML += /*html*/ `
      <td class="has-text-centered has-border-left">
        <button
          class="button is-small permission-toggle ${user.isAdmin ? activePermissionClass : inactivePermissionClass}"
          data-permission="isAdmin"
          data-user-name="${cityssm.escapeHTML(user.userName)}"
          title="Toggle Is Admin"
        >
          ${user.isAdmin ? 'Yes' : 'No'}
        </button>
      </td>
      <td class="has-text-centered has-border-left">
        <div class="buttons is-justify-content-center">
          <button
            class="button is-small is-info edit-user-settings"
            data-user-name="${cityssm.escapeHTML(user.userName)}"
            title="Edit User Settings"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-cog"></i>
            </span>
            <span>Settings</span>
          </button>
          <button
            class="button is-small is-danger delete-user"
            data-user-name="${cityssm.escapeHTML(user.userName)}"
            title="Delete User"
          >
            Delete
          </button>
        </div>
      </td>
    `

    return rowElement
  }

  function renderUsers(users: DatabaseUser[]): void {
    if (users.length === 0) {
      usersContainerElement.innerHTML = '<p>No users found.</p>'
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    const sectionColumnHeaderHTML = /* html */ `
      <th class="has-text-centered has-border-left">View</th>
      <th class="has-text-centered">Update</th>
      <th class="has-text-centered">Manage</th>
    `

    // eslint-disable-next-line no-unsanitized/property
    tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th rowspan="2">User Name</th>
          <th class="has-text-centered has-border-left" rowspan="2">Can Login</th>
          ${
            shiftLog.shiftsAreEnabled
              ? `<th class="has-text-centered has-border-left" colspan="3">${cityssm.escapeHTML(shiftLog.shiftsSectionName)}</th>`
              : ''
          }
          ${
            shiftLog.workOrdersAreEnabled
              ? `<th class="has-text-centered has-border-left" colspan="3">${cityssm.escapeHTML(shiftLog.workOrdersSectionName)}</th>`
              : ''
          }
          ${
            shiftLog.timesheetsAreEnabled
              ? `<th class="has-text-centered has-border-left" colspan="3">${cityssm.escapeHTML(shiftLog.timesheetsSectionName)}</th>`
              : ''
          }
          <th class="has-text-centered has-border-left" rowspan="2">Is Admin</th>
          <th class="has-text-centered has-border-left" rowspan="2">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
        <tr>
          ${shiftLog.shiftsAreEnabled ? sectionColumnHeaderHTML : ''}
          ${shiftLog.workOrdersAreEnabled ? sectionColumnHeaderHTML : ''}
          ${shiftLog.timesheetsAreEnabled ? sectionColumnHeaderHTML : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `

    for (const user of users) {
      const rowElement = buildUserRowElement(user)
      tableElement.querySelector('tbody')?.append(rowElement)
    }

    // Add event listeners for permission toggles
    for (const button of tableElement.querySelectorAll('.permission-toggle')) {
      button.addEventListener('click', toggleUserPermission)
    }

    // Add event listeners for edit settings buttons
    for (const button of tableElement.querySelectorAll('.edit-user-settings')) {
      button.addEventListener('click', editUserSettings)
    }

    // Add event listeners for delete buttons
    for (const button of tableElement.querySelectorAll('.delete-user')) {
      button.addEventListener('click', deleteUser)
    }

    usersContainerElement.replaceChildren(tableElement)
  }

  document.querySelector('#button--addUser')?.addEventListener('click', () => {
    let closeModalFunction: () => void

    function doAddUser(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddUser`,
        addForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean

            users: DatabaseUser[]
          }

          if (responseJSON.success) {
            closeModalFunction()
            exports.users = responseJSON.users
            renderUsers(responseJSON.users)
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding User',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminUsers-add', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector('#span--domain') as HTMLSpanElement
        ).textContent = `${exports.domain}\\`
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddUser)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  })

  renderUsers(exports.users)
})()
