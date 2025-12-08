// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { WorkOrderMoreInfoForm } from '../../helpers/workOrderMoreInfoForms.helpers.js'

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

interface WorkOrderTypeDefaultMilestone {
  milestoneTitle: string
  milestoneDescription: string
  dueDays?: number | null
  orderNumber: number
}

interface WorkOrderType {
  defaultMilestones?: WorkOrderTypeDefaultMilestone[]
  dueDays?: number | null
  moreInfoFormNames?: string[]
  orderNumber: number
  userGroupId: number | null
  userGroupName?: string | null
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
  availableWorkOrderMoreInfoForms: Record<string, WorkOrderMoreInfoForm>
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

    // Clear existing
    tbodyElement.innerHTML = ''

    for (const workOrderType of workOrderTypes) {
      const userGroupDisplay =
        (workOrderType.userGroupName ?? '') === ''
          ? '<span class="has-text-grey-light">-</span>'
          : `<span class="tag is-info">${cityssm.escapeHTML(workOrderType.userGroupName ?? '')}</span>`

      const rowElement = document.createElement('tr')

      rowElement.dataset.workOrderTypeId =
        workOrderType.workOrderTypeId.toString()

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = /* html */ `
        <td class="has-text-centered">
          <span class="icon is-small has-text-grey handle" style="cursor: move;">
            <i class="fa-solid fa-grip-vertical"></i>
          </span>
        </td>
        <td>
          <span class="work-order-type-name">
            ${cityssm.escapeHTML(workOrderType.workOrderType)}
          </span>
        </td>
        <td>
          <span class="work-order-number-prefix">
            ${cityssm.escapeHTML(workOrderType.workOrderNumberPrefix)}
          </span>
        </td>
        <td>
          ${userGroupDisplay}
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button
              class="button is-info button--editWorkOrderType"
              data-work-order-type-id="${workOrderType.workOrderTypeId}"
              data-work-order-type="${cityssm.escapeHTML(workOrderType.workOrderType)}"
              data-work-order-number-prefix="${cityssm.escapeHTML(workOrderType.workOrderNumberPrefix)}"
              data-due-days="${workOrderType.dueDays ?? ''}"
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
      `

      tbodyElement.append(rowElement)
    }

    attachEventListeners()
    initializeSortable()
  }

  function addWorkOrderType(): void {
    let closeModalFunction: () => void

    function doAddWorkOrderType(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddWorkOrderType`,
        addForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            workOrderTypes?: WorkOrderType[]
          }

          if (
            responseJSON.success &&
            responseJSON.workOrderTypes !== undefined
          ) {
            closeModalFunction()
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
              title: 'Error Adding Work Order Type',

              message: 'An error occurred. Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminWorkOrderTypes-add', {
      onshow(modalElement) {
        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#addWorkOrderType--userGroupId'
        ) as HTMLSelectElement

        for (const userGroup of exports.userGroups) {
          const option = document.createElement('option')
          option.value = userGroup.userGroupId.toString()
          option.textContent = userGroup.userGroupName
          userGroupSelect.append(option)
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddWorkOrderType)
        ;(
          modalElement.querySelector(
            '#addWorkOrderType--workOrderType'
          ) as HTMLInputElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function editWorkOrderType(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const workOrderTypeId = buttonElement.dataset.workOrderTypeId
    const currentWorkOrderType = buttonElement.dataset.workOrderType
    const currentWorkOrderNumberPrefix =
      buttonElement.dataset.workOrderNumberPrefix
    const currentDueDays = buttonElement.dataset.dueDays
    const currentUserGroupId = buttonElement.dataset.userGroupId

    if (
      workOrderTypeId === undefined ||
      currentWorkOrderType === undefined ||
      currentWorkOrderNumberPrefix === undefined
    ) {
      return
    }

    // Get the current moreInfoFormNames from the workOrderTypes array
    const workOrderTypeData = workOrderTypes.find(
      (wot) => wot.workOrderTypeId === Number.parseInt(workOrderTypeId, 10)
    )
    const currentMoreInfoFormNames = workOrderTypeData?.moreInfoFormNames ?? []

    let closeModalFunction: () => void

    function doUpdateWorkOrderType(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      // Collect milestone data
      const modalElement = editForm.closest('.modal') as HTMLElement
      const milestoneItems = modalElement.querySelectorAll('.milestone-item')
      const milestones: WorkOrderTypeDefaultMilestone[] = []

      for (const [index, item] of milestoneItems.entries()) {
        const titleInput = item.querySelector(
          '.milestone-title'
        ) as HTMLInputElement
        
        const descriptionInput = item.querySelector(
          '.milestone-description'
        ) as HTMLTextAreaElement

        const dueDaysInput = item.querySelector(
          '.milestone-due-days'
        ) as HTMLInputElement

        const title = titleInput.value.trim()
        if (title !== '') {
          const dueDaysValue = dueDaysInput.value.trim()
          milestones.push({
            milestoneTitle: title,
            milestoneDescription: descriptionInput.value.trim(),
            dueDays:
              dueDaysValue === '' ? null : Number.parseInt(dueDaysValue, 10),
            orderNumber: index
          })
        }
      }

      // Add milestones as hidden input to form
      const existingMilestonesInput = editForm.querySelector(
        'input[name="defaultMilestones"]'
      )
      if (existingMilestonesInput !== null) {
        existingMilestonesInput.remove()
      }

      const milestonesInput = document.createElement('input')
      milestonesInput.type = 'hidden'
      milestonesInput.name = 'defaultMilestones'
      milestonesInput.value = JSON.stringify(milestones)
      editForm.append(milestonesInput)

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateWorkOrderType`,
        editForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            workOrderTypes?: WorkOrderType[]
          }

          if (
            responseJSON.success &&
            responseJSON.workOrderTypes !== undefined
          ) {
            closeModalFunction()
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
    }

    cityssm.openHtmlModal('adminWorkOrderTypes-edit', {
      onshow(modalElement) {
        // Set form values
        ;(
          modalElement.querySelector(
            '#editWorkOrderType--workOrderTypeId'
          ) as HTMLInputElement
        ).value = workOrderTypeId
        ;(
          modalElement.querySelector(
            '#editWorkOrderType--workOrderType'
          ) as HTMLInputElement
        ).value = currentWorkOrderType
        ;(
          modalElement.querySelector(
            '#editWorkOrderType--workOrderNumberPrefix'
          ) as HTMLInputElement
        ).value = currentWorkOrderNumberPrefix
        ;(
          modalElement.querySelector(
            '#editWorkOrderType--dueDays'
          ) as HTMLInputElement
        ).value = currentDueDays ?? ''

        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#editWorkOrderType--userGroupId'
        ) as HTMLSelectElement

        for (const userGroup of exports.userGroups) {
          const option = document.createElement('option')
          option.value = userGroup.userGroupId.toString()
          option.textContent = userGroup.userGroupName
          if (
            currentUserGroupId !== undefined &&
            currentUserGroupId !== '' &&
            Number.parseInt(currentUserGroupId, 10) === userGroup.userGroupId
          ) {
            option.selected = true
          }
          userGroupSelect.append(option)
        }

        // Populate more info forms checkboxes
        const moreInfoFormsContainer = modalElement.querySelector(
          '#editWorkOrderType--moreInfoForms'
        ) as HTMLElement

        const availableForms = exports.availableWorkOrderMoreInfoForms
        const formKeys = Object.keys(availableForms)

        if (formKeys.length === 0) {
          moreInfoFormsContainer.innerHTML =
            '<span class="has-text-grey">No additional forms available.</span>'
        } else {
          let formsHtml = ''
          for (const formKey of formKeys) {
            const formLabel = availableForms[formKey].formName

            const isChecked = currentMoreInfoFormNames.includes(formKey)

            formsHtml += /* html */ `
              <label class="checkbox is-block mb-2">
                <input
                  name="moreInfoFormNames"
                  type="checkbox"
                  value="${cityssm.escapeHTML(formKey)}"
                  ${isChecked ? 'checked' : ''}
                />
                ${cityssm.escapeHTML(formLabel)}
              </label>
            `
          }
          // eslint-disable-next-line no-unsanitized/property
          moreInfoFormsContainer.innerHTML = formsHtml
        }

        // Populate default milestones
        const currentDefaultMilestones =
          workOrderTypeData?.defaultMilestones ?? []
        const defaultMilestonesContainer = modalElement.querySelector(
          '#editWorkOrderType--defaultMilestones'
        ) as HTMLElement

        function renderDefaultMilestones(): void {
          const milestones =
            defaultMilestonesContainer.querySelectorAll('.milestone-item')
          if (milestones.length === 0) {
            defaultMilestonesContainer.innerHTML =
              '<p class="has-text-grey is-size-7 mb-2">No default milestones. Click "Add Milestone" to create one.</p>'
          }
        }

        function addMilestoneItem(
          title = '',
          description = '',
          dueDays: number | null | undefined = null,
          orderNumber = 0
        ): void {
          const milestoneElement = document.createElement('div')
          milestoneElement.className = 'milestone-item box p-3 mb-2'
          milestoneElement.dataset.orderNumber = orderNumber.toString()

          // eslint-disable-next-line no-unsanitized/property
          milestoneElement.innerHTML = /* html */ `
            <div class="is-flex is-align-items-start">
              <span class="icon is-small has-text-grey milestone-handle mr-2" style="cursor: move;">
                <i class="fa-solid fa-grip-vertical"></i>
              </span>
              <div class="is-flex-grow-1">
                <div class="field mb-2">
                  <label class="label is-size-7">Milestone Title</label>
                  <div class="control">
                    <input
                      class="input is-small milestone-title"
                      type="text"
                      maxlength="100"
                      placeholder="e.g., Design Review, Approval, Completion"
                      value="${cityssm.escapeHTML(title)}"
                      required
                    />
                  </div>
                </div>
                <div class="field mb-2">
                  <label class="label is-size-7">Milestone Description (Optional)</label>
                  <div class="control">
                    <textarea
                      class="textarea is-small milestone-description"
                      rows="2"
                      placeholder="Description of this milestone..."
                    >${cityssm.escapeHTML(description)}</textarea>
                  </div>
                </div>
                <div class="field mb-0">
                  <label class="label is-size-7">Days Until Due (Optional)</label>
                  <div class="control">
                    <input
                      class="input is-small milestone-due-days"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Number of days"
                      value="${dueDays ?? ''}"
                    />
                  </div>
                  <p class="help is-size-7">
                    If specified, the milestone due date will be automatically set this many days after the work order open date.
                  </p>
                </div>
              </div>
              <button
                class="button is-small is-danger ml-2 remove-milestone-button"
                type="button"
                title="Remove Milestone"
              >
                <span class="icon is-small">
                  <i class="fa-solid fa-times"></i>
                </span>
              </button>
            </div>
          `

          // Add remove button event
          milestoneElement
            .querySelector('.remove-milestone-button')
            ?.addEventListener('click', () => {
              milestoneElement.remove()
              renderDefaultMilestones()
            })

          defaultMilestonesContainer.append(milestoneElement)
        }

        // Clear container and add existing milestones
        defaultMilestonesContainer.innerHTML = ''
        for (const [index, milestone] of currentDefaultMilestones.entries()) {
          addMilestoneItem(
            milestone.milestoneTitle,
            milestone.milestoneDescription,
            milestone.dueDays,
            index
          )
        }
        renderDefaultMilestones()

        // Initialize sortable for milestones
        Sortable.create(defaultMilestonesContainer, {
          animation: 150,
          handle: '.milestone-handle',
          onEnd() {
            // Update order numbers after sorting
            const items =
              defaultMilestonesContainer.querySelectorAll('.milestone-item')
            for (const [index, item] of items.entries()) {
              ;(item as HTMLElement).dataset.orderNumber = index.toString()
            }
          }
        })

        // Add milestone button event
        modalElement
          .querySelector('#editWorkOrderType--addMilestoneButton')
          ?.addEventListener('click', () => {
            const currentCount =
              defaultMilestonesContainer.querySelectorAll(
                '.milestone-item'
              ).length
            addMilestoneItem('', '', null, currentCount)
            renderDefaultMilestones()
          })
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateWorkOrderType)

        const typeInputElement = modalElement.querySelector(
          '#editWorkOrderType--workOrderType'
        ) as HTMLInputElement
        typeInputElement.focus()
        typeInputElement.select()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
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
