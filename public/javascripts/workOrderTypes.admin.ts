import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const Sortable: {
  create: (
    element: HTMLElement,
    options: {
      animation: number
      handle: string
      onEnd: () => void
    }
  ) => void
}

interface WorkOrderType {
  orderNumber: number
  userGroupId: number | null
  userGroupName?: string
  workOrderNumberPrefix: string
  workOrderType: string
  workOrderTypeId: number
}

interface UserGroup {
  memberCount?: number
  userGroupId: number
  userGroupName: string
}

declare const exports: {
  shiftLog: ShiftLogGlobal
  userGroups: UserGroup[]
  workOrderTypes: WorkOrderType[]
}
;(() => {
  const shiftLog = exports.shiftLog
  let workOrderTypes = exports.workOrderTypes

  const tbodyElement = document.querySelector(
    '#tbody--workOrderTypes'
  ) as HTMLElement

  function renderWorkOrderTypes(): void {
    if (workOrderTypes.length === 0) {
      tbodyElement.innerHTML = `<tr id="tr--noWorkOrderTypes">
        <td colspan="5" class="has-text-centered has-text-grey">
          No work order types found. Click "Add Work Order Type" to create one.
        </td>
      </tr>`
      return
    }

    let html = ''

    for (const workOrderType of workOrderTypes) {
      const userGroupDisplay =
        workOrderType.userGroupName !== undefined &&
        workOrderType.userGroupName !== ''
          ? `<span class="tag is-info">${cityssm.escapeHTML(workOrderType.userGroupName)}</span>`
          : '<span class="has-text-grey-light">-</span>'

      html += /* html */ `
        <tr data-work-order-type-id="${workOrderType.workOrderTypeId}">
          <td class="has-text-centered">
            <span class="icon is-small has-text-grey handle" style="cursor: move;">
              <i class="fa-solid fa-grip-vertical"></i>
            </span>
          </td>
          <td>
            <span class="work-order-type-name">${cityssm.escapeHTML(workOrderType.workOrderType)}</span>
          </td>
          <td>
            <span class="work-order-number-prefix">${cityssm.escapeHTML(workOrderType.workOrderNumberPrefix)}</span>
          </td>
          <td>
            ${userGroupDisplay}
          </td>
          <td>
            <div class="buttons are-small">
              <button
                class="button is-info button--editWorkOrderType"
                data-work-order-type-id="${workOrderType.workOrderTypeId}"
                data-work-order-type="${cityssm.escapeHTML(workOrderType.workOrderType)}"
                data-work-order-number-prefix="${cityssm.escapeHTML(workOrderType.workOrderNumberPrefix)}"
                data-user-group-id="${workOrderType.userGroupId ?? ''}"
                type="button"
              >
                <span class="icon">
                  <i class="fa-solid fa-pencil"></i>
                </span>
                <span>Edit</span>
              </button>
              <button
                class="button is-danger button--deleteWorkOrderType"
                data-work-order-type-id="${workOrderType.workOrderTypeId}"
                data-work-order-type="${cityssm.escapeHTML(workOrderType.workOrderType)}"
                type="button"
              >
                <span class="icon">
                  <i class="fa-solid fa-trash"></i>
                </span>
                <span>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      `
    }

    // eslint-disable-next-line no-unsanitized/property
    tbodyElement.innerHTML = html
    attachEventListeners()
    initializeSortable()
  }

  function addWorkOrderType(): void {
    // Build user group options
    let userGroupOptions = '<option value="">None (Available to All)</option>'
    for (const userGroup of exports.userGroups) {
      userGroupOptions += `<option value="${userGroup.userGroupId}">${cityssm.escapeHTML(userGroup.userGroupName)}</option>`
    }

    bulmaJS.confirm({
      contextualColorName: 'primary',
      message: `<div class="field">
        <label class="label">Type Name</label>
        <div class="control">
          <input class="input" id="input--workOrderType" type="text" required maxlength="100" />
        </div>
      </div>
      <div class="field">
        <label class="label">Work Order Number Prefix</label>
        <div class="control">
          <input class="input" id="input--workOrderNumberPrefix" type="text" maxlength="10" placeholder="e.g. WO-, PW-, etc." />
        </div>
        <p class="help">This prefix will be added to work order numbers for this type.</p>
      </div>
      <div class="field">
        <label class="label">User Group (Optional)</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="select--userGroup">
              ${userGroupOptions}
            </select>
          </div>
        </div>
        <p class="help">If specified, only members of this user group will see this work order type.</p>
      </div>`,
      messageIsHtml: true,
      okButton: {
        callbackFunction() {
          const typeInputElement = document.querySelector(
            '#input--workOrderType'
          ) as HTMLInputElement
          const prefixInputElement = document.querySelector(
            '#input--workOrderNumberPrefix'
          ) as HTMLInputElement
          const userGroupSelectElement = document.querySelector(
            '#select--userGroup'
          ) as HTMLSelectElement

          const workOrderType = typeInputElement.value.trim()

          if (workOrderType === '') {
            bulmaJS.alert({
              contextualColorName: 'warning',
              message: 'Please enter a work order type name.',
              title: 'Type Name Required'
            })
            return
          }

          const workOrderNumberPrefix = prefixInputElement.value.trim()
          const userGroupIdValue = userGroupSelectElement.value
          const userGroupId =
            userGroupIdValue === ''
              ? undefined
              : Number.parseInt(userGroupIdValue, 10)

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doAddWorkOrderType`,
            {
              userGroupId,
              workOrderNumberPrefix,
              workOrderType
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                workOrderTypes?: WorkOrderType[]
              }

              if (
                responseJSON.success &&
                responseJSON.workOrderTypes !== undefined
              ) {
                workOrderTypes = responseJSON.workOrderTypes
                renderWorkOrderTypes()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'The work order type has been successfully added.',
                  title: 'Work Order Type Added'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  message: 'An error occurred. Please try again.',
                  title: 'Error Adding Work Order Type'
                })
              }
            }
          )
        },
        text: 'Add Work Order Type'
      },
      title: 'Add Work Order Type'
    })

    const typeInputElement = document.querySelector(
      '#input--workOrderType'
    ) as HTMLInputElement
    typeInputElement.focus()
  }

  function editWorkOrderType(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const workOrderTypeId = buttonElement.dataset.workOrderTypeId
    const currentWorkOrderType = buttonElement.dataset.workOrderType
    const currentWorkOrderNumberPrefix =
      buttonElement.dataset.workOrderNumberPrefix
    const currentUserGroupId = buttonElement.dataset.userGroupId

    if (
      workOrderTypeId === undefined ||
      currentWorkOrderType === undefined ||
      currentWorkOrderNumberPrefix === undefined
    ) {
      return
    }

    // Build user group options
    let userGroupOptions = '<option value="">None (Available to All)</option>'
    for (const userGroup of exports.userGroups) {
      const selected =
        currentUserGroupId !== undefined &&
        currentUserGroupId !== '' &&
        Number.parseInt(currentUserGroupId, 10) === userGroup.userGroupId
          ? 'selected'
          : ''
      userGroupOptions += `<option value="${userGroup.userGroupId}" ${selected}>${cityssm.escapeHTML(userGroup.userGroupName)}</option>`
    }

    bulmaJS.confirm({
      contextualColorName: 'info',
      message: `<div class="field">
        <label class="label">Type Name</label>
        <div class="control">
          <input class="input" id="input--editWorkOrderType" type="text" value="${cityssm.escapeHTML(currentWorkOrderType)}" required maxlength="100" />
        </div>
      </div>
      <div class="field">
        <label class="label">Work Order Number Prefix</label>
        <div class="control">
          <input class="input" id="input--editWorkOrderNumberPrefix" type="text" value="${cityssm.escapeHTML(currentWorkOrderNumberPrefix)}" maxlength="10" placeholder="e.g. WO-, PW-, etc." />
        </div>
        <p class="help">This prefix will be added to work order numbers for this type.</p>
      </div>
      <div class="field">
        <label class="label">User Group (Optional)</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="select--editUserGroup">
              ${userGroupOptions}
            </select>
          </div>
        </div>
        <p class="help">If specified, only members of this user group will see this work order type.</p>
      </div>`,
      messageIsHtml: true,
      okButton: {
        callbackFunction() {
          const typeInputElement = document.querySelector(
            '#input--editWorkOrderType'
          ) as HTMLInputElement
          const prefixInputElement = document.querySelector(
            '#input--editWorkOrderNumberPrefix'
          ) as HTMLInputElement
          const userGroupSelectElement = document.querySelector(
            '#select--editUserGroup'
          ) as HTMLSelectElement

          const newWorkOrderType = typeInputElement.value.trim()

          if (newWorkOrderType === '') {
            bulmaJS.alert({
              contextualColorName: 'warning',
              message: 'Please enter a work order type name.',
              title: 'Type Name Required'
            })
            return
          }

          const newWorkOrderNumberPrefix = prefixInputElement.value.trim()
          const userGroupIdValue = userGroupSelectElement.value
          const newUserGroupId =
            userGroupIdValue === ''
              ? undefined
              : Number.parseInt(userGroupIdValue, 10)

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doUpdateWorkOrderType`,
            {
              userGroupId: newUserGroupId,
              workOrderNumberPrefix: newWorkOrderNumberPrefix,
              workOrderType: newWorkOrderType,
              workOrderTypeId: Number.parseInt(workOrderTypeId, 10)
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                workOrderTypes?: WorkOrderType[]
              }

              if (
                responseJSON.success &&
                responseJSON.workOrderTypes !== undefined
              ) {
                workOrderTypes = responseJSON.workOrderTypes
                renderWorkOrderTypes()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'The work order type has been successfully updated.',
                  title: 'Work Order Type Updated'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  message: 'An error occurred. Please try again.',
                  title: 'Error Updating Work Order Type'
                })
              }
            }
          )
        },
        text: 'Update Work Order Type'
      },
      title: 'Edit Work Order Type'
    })

    const typeInputElement = document.querySelector(
      '#input--editWorkOrderType'
    ) as HTMLInputElement
    typeInputElement.focus()
    typeInputElement.select()
  }

  function deleteWorkOrderType(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const workOrderTypeId = buttonElement.dataset.workOrderTypeId
    const workOrderType = buttonElement.dataset.workOrderType

    if (workOrderTypeId === undefined || workOrderType === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      message: `Are you sure you want to delete "${workOrderType}"? This action cannot be undone.`,
      okButton: {
        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteWorkOrderType`,
            {
              workOrderTypeId: Number.parseInt(workOrderTypeId, 10)
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                workOrderTypes?: WorkOrderType[]
              }

              if (
                responseJSON.success &&
                responseJSON.workOrderTypes !== undefined
              ) {
                workOrderTypes = responseJSON.workOrderTypes
                renderWorkOrderTypes()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'The work order type has been successfully deleted.',
                  title: 'Work Order Type Deleted'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  message: 'An error occurred. Please try again.',
                  title: 'Error Deleting Work Order Type'
                })
              }
            }
          )
        },
        contextualColorName: 'danger',
        text: 'Delete Work Order Type'
      },
      title: 'Delete Work Order Type'
    })
  }

  function attachEventListeners(): void {
    // Edit buttons
    const editButtons = document.querySelectorAll('.button--editWorkOrderType')
    for (const button of editButtons) {
      button.addEventListener('click', editWorkOrderType)
    }

    // Delete buttons
    const deleteButtons = document.querySelectorAll(
      '.button--deleteWorkOrderType'
    )
    for (const button of deleteButtons) {
      button.addEventListener('click', deleteWorkOrderType)
    }
  }

  function initializeSortable(): void {
    if (workOrderTypes.length > 0) {
      Sortable.create(tbodyElement, {
        animation: 150,
        handle: '.handle',
        onEnd() {
          // Get the new order
          const rows = tbodyElement.querySelectorAll(
            'tr[data-work-order-type-id]'
          )
          const workOrderTypeIds: number[] = []

          for (const row of rows) {
            const id = (row as HTMLElement).dataset.workOrderTypeId
            if (id !== undefined) {
              workOrderTypeIds.push(Number.parseInt(id, 10))
            }
          }

          // Send to server
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doReorderWorkOrderTypes`,
            {
              workOrderTypeIds
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                workOrderTypes?: WorkOrderType[]
              }

              if (!responseJSON.success) {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  message: 'Please refresh the page and try again.',
                  title: 'Error Reordering Work Order Types'
                })
              }
            }
          )
        }
      })
    }
  }

  // Add work order type button
  const addButton = document.querySelector('#button--addWorkOrderType')
  if (addButton !== null) {
    addButton.addEventListener('click', addWorkOrderType)
  }

  // Initialize
  attachEventListeners()
  initializeSortable()
})()
