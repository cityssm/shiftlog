import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const Sortable: {
  create: (
    element: HTMLElement,
    options: {
      handle: string
      animation: number
      onEnd: () => void
    }
  ) => void
}

interface WorkOrderType {
  workOrderTypeId: number
  workOrderType: string
  workOrderNumberPrefix: string
  orderNumber: number
  userGroupId: number | null
  userGroupName?: string
}

interface UserGroup {
  userGroupId: number
  userGroupName: string
  memberCount?: number
}

declare const exports: {
  shiftLog: ShiftLogGlobal
  workOrderTypes: WorkOrderType[]
  userGroups: UserGroup[]
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
      const userGroupDisplay = workOrderType.userGroupName
        ? `<span class="tag is-info">${cityssm.escapeHTML(workOrderType.userGroupName)}</span>`
        : '<span class="has-text-grey-light">-</span>'

      html += `<tr data-work-order-type-id="${workOrderType.workOrderTypeId}">
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
            <button class="button is-info button--editWorkOrderType" 
                    type="button"
                    data-work-order-type-id="${workOrderType.workOrderTypeId}"
                    data-work-order-type="${cityssm.escapeHTML(workOrderType.workOrderType)}"
                    data-work-order-number-prefix="${cityssm.escapeHTML(workOrderType.workOrderNumberPrefix)}"
                    data-user-group-id="${workOrderType.userGroupId ?? ''}">
              <span class="icon">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit</span>
            </button>
            <button class="button is-danger button--deleteWorkOrderType" 
                    type="button"
                    data-work-order-type-id="${workOrderType.workOrderTypeId}"
                    data-work-order-type="${cityssm.escapeHTML(workOrderType.workOrderType)}">
              <span class="icon">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>`
    }

    tbodyElement.innerHTML = html
    attachEventListeners()
    initializeSortable()
  }

  function addWorkOrderType(): void {
    let typeInputElement: HTMLInputElement
    let prefixInputElement: HTMLInputElement
    let userGroupSelectElement: HTMLSelectElement

    // Build user group options
    let userGroupOptions = '<option value="">None (Available to All)</option>'
    for (const userGroup of exports.userGroups) {
      userGroupOptions += `<option value="${userGroup.userGroupId}">${cityssm.escapeHTML(userGroup.userGroupName)}</option>`
    }

    bulmaJS.confirm({
      title: 'Add Work Order Type',
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
      contextualColorName: 'primary',
      okButton: {
        text: 'Add Work Order Type',
        callbackFunction() {
          const workOrderType = typeInputElement.value.trim()

          if (workOrderType === '') {
            bulmaJS.alert({
              contextualColorName: 'warning',
              title: 'Type Name Required',
              message: 'Please enter a work order type name.'
            })
            return
          }

          const workOrderNumberPrefix = prefixInputElement.value.trim()
          const userGroupIdValue = userGroupSelectElement.value
          const userGroupId = userGroupIdValue
            ? Number.parseInt(userGroupIdValue)
            : null

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doAddWorkOrderType`,
            {
              workOrderType,
              workOrderNumberPrefix,
              userGroupId
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
                  title: 'Work Order Type Added',
                  message: 'The work order type has been successfully added.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Adding Work Order Type',
                  message: 'Please try again.'
                })
              }
            }
          )
        }
      }
    })

    typeInputElement = document.querySelector(
      '#input--workOrderType'
    ) as HTMLInputElement
    prefixInputElement = document.querySelector(
      '#input--workOrderNumberPrefix'
    ) as HTMLInputElement
    userGroupSelectElement = document.querySelector(
      '#select--userGroup'
    ) as HTMLSelectElement
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

    let typeInputElement: HTMLInputElement
    let prefixInputElement: HTMLInputElement
    let userGroupSelectElement: HTMLSelectElement

    // Build user group options
    let userGroupOptions = '<option value="">None (Available to All)</option>'
    for (const userGroup of exports.userGroups) {
      const selected =
        currentUserGroupId &&
        Number.parseInt(currentUserGroupId) === userGroup.userGroupId
          ? 'selected'
          : ''
      userGroupOptions += `<option value="${userGroup.userGroupId}" ${selected}>${cityssm.escapeHTML(userGroup.userGroupName)}</option>`
    }

    bulmaJS.confirm({
      title: 'Edit Work Order Type',
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
      contextualColorName: 'info',
      okButton: {
        text: 'Update Work Order Type',
        callbackFunction() {
          const newWorkOrderType = typeInputElement.value.trim()

          if (newWorkOrderType === '') {
            bulmaJS.alert({
              contextualColorName: 'warning',
              title: 'Type Name Required',
              message: 'Please enter a work order type name.'
            })
            return
          }

          const newWorkOrderNumberPrefix = prefixInputElement.value.trim()
          const userGroupIdValue = userGroupSelectElement.value
          const newUserGroupId = userGroupIdValue
            ? Number.parseInt(userGroupIdValue)
            : null

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doUpdateWorkOrderType`,
            {
              workOrderTypeId: Number.parseInt(workOrderTypeId),
              workOrderType: newWorkOrderType,
              workOrderNumberPrefix: newWorkOrderNumberPrefix,
              userGroupId: newUserGroupId
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
                  title: 'Work Order Type Updated',
                  message: 'The work order type has been successfully updated.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Updating Work Order Type',
                  message: 'Please try again.'
                })
              }
            }
          )
        }
      }
    })

    typeInputElement = document.querySelector(
      '#input--editWorkOrderType'
    ) as HTMLInputElement
    prefixInputElement = document.querySelector(
      '#input--editWorkOrderNumberPrefix'
    ) as HTMLInputElement
    userGroupSelectElement = document.querySelector(
      '#select--editUserGroup'
    ) as HTMLSelectElement
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
      title: 'Delete Work Order Type',
      message: `Are you sure you want to delete "${workOrderType}"? This action cannot be undone.`,
      contextualColorName: 'warning',
      okButton: {
        text: 'Delete Work Order Type',
        contextualColorName: 'danger',
        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteWorkOrderType`,
            {
              workOrderTypeId: Number.parseInt(workOrderTypeId)
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
                  title: 'Work Order Type Deleted',
                  message: 'The work order type has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Work Order Type',
                  message: 'Please try again.'
                })
              }
            }
          )
        }
      }
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
        handle: '.handle',
        animation: 150,
        onEnd() {
          // Get the new order
          const rows = tbodyElement.querySelectorAll(
            'tr[data-work-order-type-id]'
          )
          const workOrderTypeIds: number[] = []

          for (const row of rows) {
            const workOrderTypeId = (row as HTMLElement).dataset
              .workOrderTypeId
            if (workOrderTypeId !== undefined) {
              workOrderTypeIds.push(Number.parseInt(workOrderTypeId))
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
                  title: 'Error Reordering Work Order Types',
                  message: 'Please refresh the page and try again.'
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
