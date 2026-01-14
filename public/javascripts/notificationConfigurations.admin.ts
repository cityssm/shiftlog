import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { NotificationConfiguration } from '../../types/record.types.js'
import type { AssignedTo } from '../../types/record.types.js'
import type {
  NotificationQueueType,
  NotificationType,
  NtfyNotificationConfig,
  EmailNotificationConfig,
  MsTeamsNotificationConfig
} from '../../tasks/notifications/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  notificationConfigurations: NotificationConfiguration[]
  assignedToList: AssignedTo[]
  notificationQueueTypes: readonly NotificationQueueType[]
  notificationTypes: readonly NotificationType[]
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog
  let notificationConfigurations = exports.notificationConfigurations

  const tbodyElement = document.querySelector(
    '#tbody--notificationConfigurations'
  ) as HTMLElement

  function renderNotificationConfigurations(): void {
    if (notificationConfigurations.length === 0) {
      tbodyElement.innerHTML = `<tr id="tr--noNotificationConfigurations">
        <td colspan="5" class="has-text-centered has-text-grey">
          No notification configurations found. Click "Add Notification Configuration" to create one.
        </td>
      </tr>`
      return
    }

    // Clear existing
    tbodyElement.innerHTML = ''

    for (const config of notificationConfigurations) {
      const assignedTo = exports.assignedToList.find(
        (at) => at.assignedToId === config.assignedToId
      )
      const assignedToDisplay =
        assignedTo === undefined
          ? '<span class="has-text-grey-light">All</span>'
          : `<span class="assigned-to-name">${cityssm.escapeHTML(assignedTo.assignedToName)}</span>`

      const rowElement = document.createElement('tr')

      rowElement.dataset.notificationConfigurationId =
        config.notificationConfigurationId.toString()

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = /* html */ `
        <td>
          <span class="notification-queue">
            ${cityssm.escapeHTML(config.notificationQueue)}
          </span>
        </td>
        <td>
          <span class="notification-type">
            ${cityssm.escapeHTML(config.notificationType)}
          </span>
        </td>
        <td>
          ${assignedToDisplay}
        </td>
        <td class="has-text-centered">
          ${
            config.isActive
              ? '<span class="tag is-success">Active</span>'
              : '<span class="tag">Inactive</span>'
          }
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button
              class="button is-light button--toggleIsActive"
              data-notification-configuration-id="${config.notificationConfigurationId}"
              data-is-active="${config.isActive ? '1' : '0'}"
              type="button"
              title="${config.isActive ? 'Deactivate' : 'Activate'}"
            >
              <span class="icon">
                <i class="fa-solid fa-toggle-${config.isActive ? 'on' : 'off'}"></i>
              </span>
            </button>
            <button
              class="button is-info button--editNotificationConfiguration"
              data-notification-configuration-id="${config.notificationConfigurationId}"
              data-notification-queue="${cityssm.escapeHTML(config.notificationQueue)}"
              data-notification-type="${cityssm.escapeHTML(config.notificationType)}"
              data-notification-type-form-json="${cityssm.escapeHTML(config.notificationTypeFormJson)}"
              data-assigned-to-id="${config.assignedToId ?? ''}"
              data-is-active="${config.isActive ? '1' : '0'}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit</span>
            </button>
            <button
              class="button is-danger button--deleteNotificationConfiguration"
              data-notification-configuration-id="${config.notificationConfigurationId}"
              data-notification-queue="${cityssm.escapeHTML(config.notificationQueue)}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `

      rowElement
        .querySelector('.button--toggleIsActive')
        ?.addEventListener('click', toggleIsActive)

      rowElement
        .querySelector('.button--editNotificationConfiguration')
        ?.addEventListener('click', editNotificationConfiguration)

      rowElement
        .querySelector('.button--deleteNotificationConfiguration')
        ?.addEventListener('click', deleteNotificationConfiguration)

      tbodyElement.append(rowElement)
    }
  }

  function toggleIsActive(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const notificationConfigurationId = buttonElement.dataset
      .notificationConfigurationId

    if (notificationConfigurationId === undefined) {
      return
    }

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/admin/doToggleNotificationConfigurationIsActive`,
      {
        notificationConfigurationId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean }

        if (responseJSON.success) {
          const configIndex = notificationConfigurations.findIndex(
            (c) =>
              c.notificationConfigurationId ===
              Number.parseInt(notificationConfigurationId, 10)
          )

          if (configIndex !== -1) {
            notificationConfigurations[configIndex].isActive =
              !notificationConfigurations[configIndex].isActive
            renderNotificationConfigurations()
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Toggling Status',
            message: 'An error occurred toggling the active status.'
          })
        }
      }
    )
  }

  function renderNotificationTypeForm(
    modalElement: HTMLElement,
    notificationType: NotificationType,
    existingConfig?: string
  ): void {
    const formContainer = modalElement.querySelector(
      '#notificationTypeFormContainer'
    ) as HTMLElement

    formContainer.innerHTML = ''

    let config: NtfyNotificationConfig | EmailNotificationConfig | MsTeamsNotificationConfig | undefined

    if (existingConfig) {
      try {
        config = JSON.parse(existingConfig)
      } catch {
        // ignore parse errors
      }
    }

    if (notificationType === 'ntfy') {
      const ntfyConfig = config as NtfyNotificationConfig | undefined
      formContainer.innerHTML = /* html */ `
        <div class="field">
          <label class="label" for="notificationTypeForm--topic">
            Ntfy Topic
          </label>
          <div class="control">
            <input
              class="input"
              id="notificationTypeForm--topic"
              name="topic"
              type="text"
              required
              value="${cityssm.escapeHTML(ntfyConfig?.topic ?? '')}"
            />
          </div>
        </div>
      `
    } else if (notificationType === 'email') {
      const emailConfig = config as EmailNotificationConfig | undefined
      formContainer.innerHTML = /* html */ `
        <div class="field">
          <label class="label" for="notificationTypeForm--recipientEmails">
            Recipient Email Addresses
            <span class="has-text-weight-normal is-size-7">(comma-separated)</span>
          </label>
          <div class="control">
            <input
              class="input"
              id="notificationTypeForm--recipientEmails"
              name="recipientEmails"
              type="text"
              required
              value="${cityssm.escapeHTML(emailConfig?.recipientEmails?.join(', ') ?? '')}"
            />
          </div>
        </div>
      `
    } else if (notificationType === 'msTeams') {
      const msTeamsConfig = config as MsTeamsNotificationConfig | undefined
      formContainer.innerHTML = /* html */ `
        <div class="field">
          <label class="label" for="notificationTypeForm--webhookUrl">
            Microsoft Teams Webhook URL
          </label>
          <div class="control">
            <input
              class="input"
              id="notificationTypeForm--webhookUrl"
              name="webhookUrl"
              type="url"
              required
              value="${cityssm.escapeHTML(msTeamsConfig?.webhookUrl ?? '')}"
            />
          </div>
        </div>
      `
    }
  }

  function addNotificationConfiguration(): void {
    let closeModalFunction: () => void

    function doAddNotificationConfiguration(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      // Build notification type form JSON
      const notificationType = (
        addForm.querySelector(
          '#addNotificationConfiguration--notificationType'
        ) as HTMLSelectElement
      ).value as NotificationType

      let notificationTypeFormJson = '{}'

      if (notificationType === 'ntfy') {
        notificationTypeFormJson = JSON.stringify({
          topic: (
            addForm.querySelector(
              '#notificationTypeForm--topic'
            ) as HTMLInputElement
          ).value
        } satisfies NtfyNotificationConfig)
      } else if (notificationType === 'email') {
        const recipientEmailsStr = (
          addForm.querySelector(
            '#notificationTypeForm--recipientEmails'
          ) as HTMLInputElement
        ).value
        notificationTypeFormJson = JSON.stringify({
          recipientEmails: recipientEmailsStr
            .split(',')
            .map((e) => e.trim())
            .filter((e) => e !== '')
        } satisfies EmailNotificationConfig)
      } else if (notificationType === 'msTeams') {
        notificationTypeFormJson = JSON.stringify({
          webhookUrl: (
            addForm.querySelector(
              '#notificationTypeForm--webhookUrl'
            ) as HTMLInputElement
          ).value
        } satisfies MsTeamsNotificationConfig)
      }

      const formData = {
        notificationQueue: (
          addForm.querySelector(
            '#addNotificationConfiguration--notificationQueue'
          ) as HTMLSelectElement
        ).value,
        notificationType,
        notificationTypeFormJson,
        assignedToId: (
          addForm.querySelector(
            '#addNotificationConfiguration--assignedToId'
          ) as HTMLSelectElement
        ).value,
        isActive: (
          addForm.querySelector(
            '#addNotificationConfiguration--isActive'
          ) as HTMLInputElement
        ).checked
      }

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddNotificationConfiguration`,
        formData,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            errorMessage?: string
            notificationConfigurationId?: number
          }

          if (responseJSON.success && responseJSON.notificationConfigurationId) {
            notificationConfigurations.push({
              notificationConfigurationId:
                responseJSON.notificationConfigurationId,
              notificationQueue: formData.notificationQueue,
              notificationType: formData.notificationType,
              notificationTypeFormJson: formData.notificationTypeFormJson,
              assignedToId:
                formData.assignedToId === ''
                  ? undefined
                  : Number.parseInt(formData.assignedToId, 10),
              isActive: formData.isActive
            })

            renderNotificationConfigurations()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Configuration',
              message: responseJSON.errorMessage ?? 'An error occurred.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminNotificationConfiguration-add', {
      onshow(modalElement) {
        // Populate notification queue options
        const queueSelect = modalElement.querySelector(
          '#addNotificationConfiguration--notificationQueue'
        ) as HTMLSelectElement

        for (const queueType of exports.notificationQueueTypes) {
          const option = document.createElement('option')
          option.value = queueType
          option.textContent = queueType
          queueSelect.append(option)
        }

        // Populate notification type options
        const typeSelect = modalElement.querySelector(
          '#addNotificationConfiguration--notificationType'
        ) as HTMLSelectElement

        for (const type of exports.notificationTypes) {
          const option = document.createElement('option')
          option.value = type
          option.textContent = type
          typeSelect.append(option)
        }

        // Populate assigned to options
        const assignedToSelect = modalElement.querySelector(
          '#addNotificationConfiguration--assignedToId'
        ) as HTMLSelectElement

        for (const assignedTo of exports.assignedToList) {
          const option = document.createElement('option')
          option.value = assignedTo.assignedToId.toString()
          option.textContent = assignedTo.assignedToName
          assignedToSelect.append(option)
        }

        // Handle notification type change
        typeSelect.addEventListener('change', () => {
          renderNotificationTypeForm(
            modalElement,
            typeSelect.value as NotificationType
          )
        })

        // Render initial form
        renderNotificationTypeForm(
          modalElement,
          typeSelect.value as NotificationType
        )
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddNotificationConfiguration)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function editNotificationConfiguration(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const notificationConfigurationId = buttonElement.dataset
      .notificationConfigurationId
    const currentNotificationQueue =
      buttonElement.dataset.notificationQueue ?? ''
    const currentNotificationType = buttonElement.dataset.notificationType ?? ''
    const currentNotificationTypeFormJson =
      buttonElement.dataset.notificationTypeFormJson ?? '{}'
    const currentAssignedToId = buttonElement.dataset.assignedToId
    const currentIsActive = buttonElement.dataset.isActive === '1'

    if (notificationConfigurationId === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateNotificationConfiguration(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      // Build notification type form JSON
      const notificationType = (
        editForm.querySelector(
          '#editNotificationConfiguration--notificationType'
        ) as HTMLSelectElement
      ).value as NotificationType

      let notificationTypeFormJson = '{}'

      if (notificationType === 'ntfy') {
        notificationTypeFormJson = JSON.stringify({
          topic: (
            editForm.querySelector(
              '#notificationTypeForm--topic'
            ) as HTMLInputElement
          ).value
        } satisfies NtfyNotificationConfig)
      } else if (notificationType === 'email') {
        const recipientEmailsStr = (
          editForm.querySelector(
            '#notificationTypeForm--recipientEmails'
          ) as HTMLInputElement
        ).value
        notificationTypeFormJson = JSON.stringify({
          recipientEmails: recipientEmailsStr
            .split(',')
            .map((e) => e.trim())
            .filter((e) => e !== '')
        } satisfies EmailNotificationConfig)
      } else if (notificationType === 'msTeams') {
        notificationTypeFormJson = JSON.stringify({
          webhookUrl: (
            editForm.querySelector(
              '#notificationTypeForm--webhookUrl'
            ) as HTMLInputElement
          ).value
        } satisfies MsTeamsNotificationConfig)
      }

      const formData = {
        notificationConfigurationId,
        notificationQueue: (
          editForm.querySelector(
            '#editNotificationConfiguration--notificationQueue'
          ) as HTMLSelectElement
        ).value,
        notificationType,
        notificationTypeFormJson,
        assignedToId: (
          editForm.querySelector(
            '#editNotificationConfiguration--assignedToId'
          ) as HTMLSelectElement
        ).value,
        isActive: (
          editForm.querySelector(
            '#editNotificationConfiguration--isActive'
          ) as HTMLInputElement
        ).checked
      }

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateNotificationConfiguration`,
        formData,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            const configIndex = notificationConfigurations.findIndex(
              (c) =>
                notificationConfigurationId !== undefined &&
                c.notificationConfigurationId ===
                  Number.parseInt(notificationConfigurationId, 10)
            )

            if (configIndex !== -1) {
              notificationConfigurations[configIndex].notificationQueue =
                formData.notificationQueue
              notificationConfigurations[configIndex].notificationType =
                formData.notificationType
              notificationConfigurations[configIndex].notificationTypeFormJson =
                formData.notificationTypeFormJson
              notificationConfigurations[configIndex].assignedToId =
                formData.assignedToId === ''
                  ? undefined
                  : Number.parseInt(formData.assignedToId, 10)
              notificationConfigurations[configIndex].isActive =
                formData.isActive
            }

            renderNotificationConfigurations()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Configuration',
              message: 'An error occurred updating the configuration.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminNotificationConfiguration-edit', {
      onshow(modalElement) {
        // Populate notification queue options
        const queueSelect = modalElement.querySelector(
          '#editNotificationConfiguration--notificationQueue'
        ) as HTMLSelectElement

        for (const queueType of exports.notificationQueueTypes) {
          const option = document.createElement('option')
          option.value = queueType
          option.textContent = queueType
          if (queueType === currentNotificationQueue) {
            option.selected = true
          }
          queueSelect.append(option)
        }

        // Populate notification type options
        const typeSelect = modalElement.querySelector(
          '#editNotificationConfiguration--notificationType'
        ) as HTMLSelectElement

        for (const type of exports.notificationTypes) {
          const option = document.createElement('option')
          option.value = type
          option.textContent = type
          if (type === currentNotificationType) {
            option.selected = true
          }
          typeSelect.append(option)
        }

        // Populate assigned to options
        const assignedToSelect = modalElement.querySelector(
          '#editNotificationConfiguration--assignedToId'
        ) as HTMLSelectElement

        for (const assignedTo of exports.assignedToList) {
          const option = document.createElement('option')
          option.value = assignedTo.assignedToId.toString()
          option.textContent = assignedTo.assignedToName
          if (
            currentAssignedToId &&
            assignedTo.assignedToId ===
              Number.parseInt(currentAssignedToId, 10)
          ) {
            option.selected = true
          }
          assignedToSelect.append(option)
        }

        // Set isActive checkbox
        ;(
          modalElement.querySelector(
            '#editNotificationConfiguration--isActive'
          ) as HTMLInputElement
        ).checked = currentIsActive

        // Handle notification type change
        typeSelect.addEventListener('change', () => {
          renderNotificationTypeForm(
            modalElement,
            typeSelect.value as NotificationType
          )
        })

        // Render initial form with existing data
        renderNotificationTypeForm(
          modalElement,
          currentNotificationType as NotificationType,
          currentNotificationTypeFormJson
        )
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateNotificationConfiguration)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteNotificationConfiguration(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const notificationConfigurationId = buttonElement.dataset
      .notificationConfigurationId
    const notificationQueue = buttonElement.dataset.notificationQueue ?? ''

    if (notificationConfigurationId === undefined) {
      return
    }

    bulmaJS.confirm({
      title: 'Delete Notification Configuration',
      message: `Are you sure you want to delete the notification configuration for "${cityssm.escapeHTML(notificationQueue)}"?`,
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Configuration',
        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteNotificationConfiguration`,
            {
              notificationConfigurationId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                notificationConfigurations =
                  notificationConfigurations.filter(
                    (c) =>
                      c.notificationConfigurationId !==
                      Number.parseInt(notificationConfigurationId, 10)
                  )

                renderNotificationConfigurations()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Configuration',
                  message: 'An error occurred deleting the configuration.'
                })
              }
            }
          )
        }
      }
    })
  }

  document
    .querySelector('#button--addNotificationConfiguration')
    ?.addEventListener('click', addNotificationConfiguration)
})()
