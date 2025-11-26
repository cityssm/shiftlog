// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type FlatPickr from 'flatpickr'

import type { ShiftLogGlobal } from './types.js'

interface DataListItem {
  dataListItemId: number
  dataListItem: string
}

declare const exports: {
  shiftLog: ShiftLogGlobal
  assignedToOptions: DataListItem[]
  workOrderAssignedToDataListItemId: number | null
  workOrderOpenDateTime: string
  isEdit: boolean
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const flatpickr: typeof FlatPickr
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
;(() => {
  const workOrderFormElement = document.querySelector(
    '#form--workOrder'
  ) as HTMLFormElement | null

  const workOrderId =
    workOrderFormElement === null
      ? ''
      : (
          workOrderFormElement.querySelector(
            '#workOrder--workOrderId'
          ) as HTMLInputElement
        ).value

  /*
   * Milestones functionality
   */

  const milestonesContainerElement = document.querySelector(
    '#container--milestones'
  ) as HTMLElement | null

  if (milestonesContainerElement !== null) {
    interface WorkOrderMilestone {
      workOrderMilestoneId: number

      workOrderId: number

      milestoneTitle: string
      milestoneDescription: string

      milestoneDueDateTime: string | null
      milestoneCompleteDateTime: string | null

      assignedToDataListItem: string | null
      assignedToDataListItemId: number | null

      orderNumber: number

      recordCreate_dateTime: string
      recordCreate_userName: string

      recordUpdate_dateTime: string
      recordUpdate_userName: string
    }

    function formatDateTime(dateTimeString: string | null): string {
      if (dateTimeString === null) {
        return ''
      }
      const date = new Date(dateTimeString)
      return `${cityssm.dateToString(date)} ${cityssm.dateToTimeString(date)}`
    }

    function renderMilestones(milestones: WorkOrderMilestone[]): void {
      // Update milestones count (completed / total)
      const milestonesCountElement = document.querySelector('#milestonesCount')
      if (milestonesCountElement !== null) {
        const completedCount = milestones.filter(
          (m) => m.milestoneCompleteDateTime !== null
        ).length
        milestonesCountElement.textContent = `${completedCount} / ${milestones.length}`
      }

      if (milestones.length === 0) {
        milestonesContainerElement.innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">No milestones have been added yet.</p>
          </div>
        `
        return
      }

      const tableElement = document.createElement('table')
      tableElement.className = 'table is-fullwidth is-striped is-hoverable'

      tableElement.innerHTML = /* html */ `
        <thead>
          <tr>
            ${exports.isEdit ? '<th class="is-hidden-print" style="width: 30px;"></th>' : ''}
            <th>Title</th>
            <th class="is-hidden-touch">Assigned To</th>
            <th>Due Date</th>
            <th>Complete Date</th>
            ${exports.isEdit ? '<th class="is-hidden-print" style="width: 80px;"></th>' : ''}
          </tr>
        </thead>
        <tbody id="tbody--milestones"></tbody>
      `

      milestonesContainerElement.replaceChildren(tableElement)

      const tbodyElement = tableElement.querySelector(
        '#tbody--milestones'
      ) as HTMLTableSectionElement

      for (const milestone of milestones) {
        const trElement = document.createElement('tr')
        trElement.dataset.milestoneId =
          milestone.workOrderMilestoneId.toString()

        const isComplete = milestone.milestoneCompleteDateTime !== null
        const isOverdue =
          !isComplete &&
          milestone.milestoneDueDateTime !== null &&
          new Date(milestone.milestoneDueDateTime) < new Date()

        const canEdit =
          exports.isEdit &&
          (exports.shiftLog.userCanManageWorkOrders ||
            milestone.recordCreate_userName === exports.shiftLog.userName)

        // eslint-disable-next-line no-unsanitized/property
        trElement.innerHTML = /* html */ `
          ${
            exports.isEdit
              ? /* html */ `
                <td class="is-hidden-print">
                  <span class="icon drag-handle" style="cursor: grab;">
                    <i class="fa-solid fa-grip-vertical"></i>
                  </span>
                </td>
              `
              : ''
          }
          <td>
            <div>
              ${isComplete ? '<span class="icon has-text-success"><i class="fa-solid fa-check-circle"></i></span> ' : ''}
              ${isOverdue ? '<span class="icon has-text-danger"><i class="fa-solid fa-exclamation-circle"></i></span> ' : ''}
              <strong>${cityssm.escapeHTML(milestone.milestoneTitle)}</strong>
            </div>
            ${
              milestone.milestoneDescription
                ? /* html */ `
                  <div class="is-size-7 has-text-grey">
                    ${cityssm.escapeHTML(milestone.milestoneDescription.slice(0, 100))}${milestone.milestoneDescription.length > 100 ? '…' : ''}
                  </div>
                `
                : ''
            }
          </td>
          <td class="is-hidden-touch">
            ${milestone.assignedToDataListItem ? cityssm.escapeHTML(milestone.assignedToDataListItem) : '<span class="has-text-grey">(Not Assigned)</span>'}
          </td>
          <td>
            ${milestone.milestoneDueDateTime ? formatDateTime(milestone.milestoneDueDateTime) : '<span class="has-text-grey">-</span>'}
          </td>
          <td>
            ${milestone.milestoneCompleteDateTime ? formatDateTime(milestone.milestoneCompleteDateTime) : '<span class="has-text-grey">-</span>'}
          </td>
          ${
            exports.isEdit
              ? `<td class="is-hidden-print">
            ${
              canEdit
                ? /* html */ `
                  <div class="buttons are-small is-justify-content-flex-end">
                    <button class="button edit-milestone" type="button" title="Edit">
                      <span class="icon"><i class="fa-solid fa-edit"></i></span>
                    </button>
                    <button class="button is-danger is-light delete-milestone" type="button" title="Delete">
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
                `
                : ''
            }
          </td>`
              : ''
          }
        `

        // Add event listeners
        if (canEdit) {
          const editButton = trElement.querySelector(
            '.edit-milestone'
          ) as HTMLButtonElement
          editButton.addEventListener('click', () => {
            showEditMilestoneModal(milestone)
          })

          const deleteButton = trElement.querySelector(
            '.delete-milestone'
          ) as HTMLButtonElement
          deleteButton.addEventListener('click', () => {
            deleteMilestone(milestone.workOrderMilestoneId)
          })
        }

        tbodyElement.append(trElement)
      }

      // Initialize sortable for reordering
      if (exports.isEdit && exports.shiftLog.userCanUpdateWorkOrders) {
        Sortable.create(tbodyElement, {
          handle: '.drag-handle',
          animation: 150,
          onEnd: () => {
            saveMilestoneOrder()
          }
        })
      }
    }

    function saveMilestoneOrder(): void {
      const tbodyElement = document.querySelector(
        '#tbody--milestones'
      ) as HTMLTableSectionElement | null
      if (tbodyElement === null) return

      const rows = tbodyElement.querySelectorAll('tr')
      const milestoneOrders: Array<{
        workOrderMilestoneId: string
        orderNumber: number
      }> = []

      for (const [index, row] of rows.entries()) {
        milestoneOrders.push({
          workOrderMilestoneId: row.dataset.milestoneId ?? '',
          orderNumber: index + 1
        })
      }

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestoneOrder`,
        { milestoneOrders },
        (responseJSON) => {
          if (!responseJSON.success) {
            bulmaJS.alert({
              contextualColorName: 'danger',
              message: 'Failed to save milestone order.'
            })
          }
        }
      )
    }

    const workOrderOpenDate = exports.workOrderOpenDateTime
      ? new Date(exports.workOrderOpenDateTime)
      : undefined

    const dateTimePickerOptions = {
      allowInput: true,
      enableTime: true,
      nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
      prevArrow: '<i class="fa-solid fa-chevron-left"></i>',
      minuteIncrement: 1,
      minDate: workOrderOpenDate
    } satisfies Partial<FlatPickr.Options.Options>

    function populateAssignedToSelect(selectElement: HTMLSelectElement): void {
      for (const option of exports.assignedToOptions) {
        const optionElement = document.createElement('option')
        optionElement.value = option.dataListItemId.toString()
        optionElement.textContent = option.dataListItem
        selectElement.append(optionElement)
      }
    }

    function showAddMilestoneModal(): void {
      let closeModalFunction: () => void

      function doAddMilestone(submitEvent: Event): void {
        submitEvent.preventDefault()
        const formElement = submitEvent.currentTarget as HTMLFormElement

        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderMilestone`,
          formElement,
          (responseJSON) => {
            if (responseJSON.success) {
              closeModalFunction()
              loadMilestones()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Failed to add milestone.'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrders-addMilestone', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#addWorkOrderMilestone--workOrderId'
            ) as HTMLInputElement
          ).value = workOrderId

          // Populate Assigned To select
          const assignedToSelect = modalElement.querySelector(
            '#addWorkOrderMilestone--assignedToDataListItemId'
          ) as HTMLSelectElement
          populateAssignedToSelect(assignedToSelect)

          // Set the default value to the work order's "assigned to" value
          if (exports.workOrderAssignedToDataListItemId !== null) {
            assignedToSelect.value =
              exports.workOrderAssignedToDataListItemId.toString()
          }

          // Initialize flatpickr on date fields
          flatpickr(
            modalElement.querySelector(
              '#addWorkOrderMilestone--milestoneDueDateTimeString'
            ) as HTMLInputElement,
            dateTimePickerOptions
          )

          const completeDatePicker = flatpickr(
            modalElement.querySelector(
              '#addWorkOrderMilestone--milestoneCompleteDateTimeString'
            ) as HTMLInputElement,
            {
              ...dateTimePickerOptions,
              maxDate: new Date()
            }
          )

          // Add "Now" button handler for complete date
          modalElement
            .querySelector('#addWorkOrderMilestone--setCompleteTimeNow')
            ?.addEventListener('click', () => {
              const now = new Date()
              completeDatePicker.set('maxDate', now)
              completeDatePicker.setDate(now, true)
            })
        },
        onshown(modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          closeModalFunction = _closeModalFunction
          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddMilestone)
          ;(
            modalElement.querySelector(
              '#addWorkOrderMilestone--milestoneTitle'
            ) as HTMLInputElement
          ).focus()
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function showEditMilestoneModal(milestone: WorkOrderMilestone): void {
      let closeModalFunction: () => void

      function doUpdateMilestone(submitEvent: Event): void {
        submitEvent.preventDefault()
        const formElement = submitEvent.currentTarget as HTMLFormElement

        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderMilestone`,
          formElement,
          (responseJSON) => {
            if (responseJSON.success) {
              closeModalFunction()
              loadMilestones()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Failed to update milestone.'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrders-editMilestone', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#editWorkOrderMilestone--workOrderMilestoneId'
            ) as HTMLInputElement
          ).value = milestone.workOrderMilestoneId.toString()
          ;(
            modalElement.querySelector(
              '#editWorkOrderMilestone--milestoneTitle'
            ) as HTMLInputElement
          ).value = milestone.milestoneTitle
          ;(
            modalElement.querySelector(
              '#editWorkOrderMilestone--milestoneDescription'
            ) as HTMLTextAreaElement
          ).value = milestone.milestoneDescription

          // Initialize flatpickr on date fields
          const dueDateInput = modalElement.querySelector(
            '#editWorkOrderMilestone--milestoneDueDateTimeString'
          ) as HTMLInputElement

          flatpickr(dueDateInput, {
            ...dateTimePickerOptions,

            defaultDate: milestone.milestoneDueDateTime
              ? new Date(milestone.milestoneDueDateTime)
              : undefined
          })

          const completeDateInput = modalElement.querySelector(
            '#editWorkOrderMilestone--milestoneCompleteDateTimeString'
          ) as HTMLInputElement
          const completeDatePicker = flatpickr(completeDateInput, {
            ...dateTimePickerOptions,

            defaultDate: milestone.milestoneCompleteDateTime
              ? new Date(milestone.milestoneCompleteDateTime)
              : undefined,
            maxDate: new Date()
          })

          // Add "Now" button handler for complete date
          modalElement
            .querySelector('#editWorkOrderMilestone--setCompleteTimeNow')
            ?.addEventListener('click', () => {
              const now = new Date()
              completeDatePicker.set('maxDate', now)
              completeDatePicker.setDate(now, true)
            })

          // Populate Assigned To select
          const assignedToSelect = modalElement.querySelector(
            '#editWorkOrderMilestone--assignedToDataListItemId'
          ) as HTMLSelectElement

          populateAssignedToSelect(assignedToSelect)

          // Set the selected option if there is one
          if (milestone.assignedToDataListItemId !== null) {
            assignedToSelect.value =
              milestone.assignedToDataListItemId.toString()
          }
        },
        onshown(modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          closeModalFunction = _closeModalFunction
          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doUpdateMilestone)
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function deleteMilestone(workOrderMilestoneId: number): void {
      bulmaJS.confirm({
        contextualColorName: 'danger',
        title: 'Delete Milestone',
        
        message: 'Are you sure you want to delete this milestone?',
        okButton: {
          text: 'Delete',

          callbackFunction: () => {
            cityssm.postJSON(
              `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderMilestone`,
              {
                workOrderMilestoneId
              },
              (responseJSON) => {
                if (responseJSON.success) {
                  loadMilestones()
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to delete milestone.'
                  })
                }
              }
            )
          }
        }
      })
    }

    function loadMilestones(): void {
      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderMilestones`,
        {},
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            milestones: WorkOrderMilestone[]
          }

          if (responseJSON.success) {
            renderMilestones(responseJSON.milestones)
          }
        }
      )
    }

    // Add milestone button
    const addMilestoneButton = document.querySelector(
      '#button--addMilestone'
    ) as HTMLButtonElement | null
    if (addMilestoneButton !== null) {
      addMilestoneButton.addEventListener('click', () => {
        showAddMilestoneModal()
      })
    }

    // Load milestones initially
    loadMilestones()
  }
})()
