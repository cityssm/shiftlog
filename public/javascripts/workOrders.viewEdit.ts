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
  const workOrderTabsContainerElement = document.querySelector(
    '#container--workOrderTabs'
  )

  if (workOrderTabsContainerElement !== null) {
    exports.shiftLog.initializeRecordTabs(
      workOrderTabsContainerElement as HTMLElement
    )
  }

  const workOrderFormElement = document.querySelector(
    '#form--workOrder'
  ) as HTMLFormElement | null

  const workOrderId =
    workOrderFormElement !== null
      ? (
          workOrderFormElement.querySelector(
            '#workOrder--workOrderId'
          ) as HTMLInputElement
        ).value
      : ''

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
      assignedToDataListItemId: number | null
      assignedToDataListItem: string | null
      orderNumber: number
      recordCreate_userName: string
      recordCreate_dateTime: string
      recordUpdate_userName: string
      recordUpdate_dateTime: string
    }

    function formatDateTime(dateTimeString: string | null): string {
      if (dateTimeString === null) {
        return ''
      }
      const date = new Date(dateTimeString)
      return cityssm.dateToString(date) + ' ' + cityssm.dateToTimeString(date)
    }

    function formatDateTimeForInput(dateTimeString: string | null): string {
      if (dateTimeString === null) {
        return ''
      }
      const date = new Date(dateTimeString)
      return (
        cityssm.dateToString(date) + 'T' + cityssm.dateToTimeString(date)
      )
    }

    function renderMilestones(milestones: WorkOrderMilestone[]): void {
      // Update milestones count (incomplete / total)
      const milestonesCountElement =
        document.querySelector('#milestonesCount')
      if (milestonesCountElement !== null) {
        const incompleteCount = milestones.filter(
          (m) => m.milestoneCompleteDateTime === null
        ).length
        milestonesCountElement.textContent = `${incompleteCount} / ${milestones.length}`
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

        trElement.innerHTML = /* html */ `
          ${
            exports.isEdit
              ? `<td class="is-hidden-print">
            <span class="icon drag-handle" style="cursor: grab;">
              <i class="fa-solid fa-grip-vertical"></i>
            </span>
          </td>`
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
                ? `<div class="is-size-7 has-text-grey">${cityssm.escapeHTML(milestone.milestoneDescription.slice(0, 100))}${milestone.milestoneDescription.length > 100 ? '…' : ''}</div>`
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

      rows.forEach((row, index) => {
        milestoneOrders.push({
          workOrderMilestoneId: row.dataset.milestoneId ?? '',
          orderNumber: index + 1
        })
      })

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
          )?.focus()
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
            maxDate: new Date(),
            defaultDate: milestone.milestoneCompleteDateTime
              ? new Date(milestone.milestoneCompleteDateTime)
              : undefined
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
            assignedToSelect.value = milestone.assignedToDataListItemId.toString()
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
        title: 'Delete Milestone',
        message: 'Are you sure you want to delete this milestone?',
        contextualColorName: 'danger',
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

  /*
   * Notes functionality
   */

  const notesContainerElement = document.querySelector(
    '#container--notes'
  ) as HTMLElement | null

  if (notesContainerElement !== null) {
    interface WorkOrderNote {
      workOrderId: number
      noteSequence: number
      noteText: string
      recordCreate_userName: string
      recordCreate_dateTime: string
      recordUpdate_userName: string
      recordUpdate_dateTime: string
    }

    function truncateText(text: string, maxLength: number): string {
      if (text.length <= maxLength) {
        return text
      }
      return text.slice(0, maxLength) + '…'
    }

    function renderNotes(notes: WorkOrderNote[]): void {
      // Update notes count
      const notesCountElement = document.querySelector('#notesCount')
      if (notesCountElement !== null) {
        notesCountElement.textContent = notes.length.toString()
      }

      if (notes.length === 0) {
        notesContainerElement.innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">No notes have been added yet.</p>
          </div>
        `
        return
      }

      notesContainerElement.innerHTML = ''

      for (const note of notes) {
        const noteElement = document.createElement('div')
        noteElement.className = 'box'

        const canEdit =
          exports.shiftLog.userCanManageWorkOrders ||
          note.recordCreate_userName === exports.shiftLog.userName

        const truncatedText = truncateText(note.noteText, 200)
        const needsExpand = note.noteText.length > 200

        noteElement.innerHTML = /* html */ `
          <article class="media">
            <div class="media-content">
              <div class="content">
                <p>
                  <strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong>
                  <small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small>
                  ${
                    note.recordUpdate_dateTime !== note.recordCreate_dateTime
                      ? `<small class="has-text-grey">(edited)</small>`
                      : ''
                  }
                  <br />
                  <span class="note-text">${cityssm.escapeHTML(truncatedText)}</span>
                  ${
                    needsExpand
                      ? `<a href="#" class="view-full-note" data-note-sequence="${note.noteSequence}">View Full Note</a>`
                      : ''
                  }
                </p>
              </div>
              ${
                canEdit
                  ? /* html */ `
                <nav class="level is-mobile">
                  <div class="level-left">
                    <a class="level-item edit-note" data-note-sequence="${note.noteSequence}">
                      <span class="icon is-small"><i class="fa-solid fa-edit"></i></span>
                    </a>
                    <a class="level-item delete-note" data-note-sequence="${note.noteSequence}">
                      <span class="icon is-small has-text-danger"><i class="fa-solid fa-trash"></i></span>
                    </a>
                  </div>
                </nav>
              `
                  : ''
              }
            </div>
          </article>
        `

        // Add event listeners
        if (needsExpand) {
          const viewFullLink = noteElement.querySelector(
            '.view-full-note'
          ) as HTMLAnchorElement
          viewFullLink.addEventListener('click', (event) => {
            event.preventDefault()
            showFullNoteModal(note)
          })
        }

        if (canEdit) {
          const editLink = noteElement.querySelector(
            '.edit-note'
          ) as HTMLAnchorElement
          editLink.addEventListener('click', (event) => {
            event.preventDefault()
            showEditNoteModal(note)
          })

          const deleteLink = noteElement.querySelector(
            '.delete-note'
          ) as HTMLAnchorElement
          deleteLink.addEventListener('click', (event) => {
            event.preventDefault()
            deleteNote(note.noteSequence)
          })
        }

        notesContainerElement.append(noteElement)
      }
    }

    function showFullNoteModal(note: WorkOrderNote): void {
      const modalElement = document.createElement('div')
      modalElement.className = 'modal is-active'
      modalElement.innerHTML = /* html */ `
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Full Note</p>
            <button class="delete" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <p><strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong></p>
            <p><small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small></p>
            <div class="content mt-3">
              <p style="white-space: pre-wrap;">${cityssm.escapeHTML(note.noteText)}</p>
            </div>
          </section>
          <footer class="modal-card-foot">
            <button class="button close-modal">Close</button>
          </footer>
        </div>
      `

      document.body.append(modalElement)

      const closeButtons = modalElement.querySelectorAll(
        '.delete, .close-modal, .modal-background'
      )
      for (const button of closeButtons) {
        button.addEventListener('click', () => {
          modalElement.remove()
        })
      }
    }

    function showEditNoteModal(note: WorkOrderNote): void {
      let closeModalFunction: () => void

      function doUpdateNote(submitEvent: Event): void {
        submitEvent.preventDefault()
        const formElement = submitEvent.currentTarget as HTMLFormElement

        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderNote`,
          formElement,
          (responseJSON) => {
            if (responseJSON.success) {
              closeModalFunction()
              loadNotes()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Failed to update note.'
              })
            }
          }
        )
      }
      cityssm.openHtmlModal('workOrders-editNote', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#editWorkOrderNote--workOrderId'
            ) as HTMLInputElement
          ).value = workOrderId
          ;(
            modalElement.querySelector(
              '#editWorkOrderNote--noteSequence'
            ) as HTMLInputElement
          ).value = note.noteSequence.toString()
          ;(
            modalElement.querySelector(
              '#editWorkOrderNote--noteText'
            ) as HTMLTextAreaElement
          ).value = note.noteText
        },
        onshown(modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          closeModalFunction = _closeModalFunction
          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doUpdateNote)
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function showAddNoteModal(): void {
      let closeModalFunction: () => void
      function doAddNote(submitEvent: Event): void {
        submitEvent.preventDefault()
        const formElement = submitEvent.currentTarget as HTMLFormElement

        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderNote`,
          formElement,
          (responseJSON) => {
            if (responseJSON.success) {
              closeModalFunction()
              formElement.reset()
              loadNotes()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Failed to add note.'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('workOrders-addNote', {
        onshow(modalElement) {
          ;(
            modalElement.querySelector(
              '#addWorkOrderNote--workOrderId'
            ) as HTMLInputElement
          ).value = workOrderId
        },
        onshown(modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          closeModalFunction = _closeModalFunction
          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddNote)
          ;(
            modalElement.querySelector(
              '#addWorkOrderNote--noteText'
            ) as HTMLTextAreaElement
          )?.focus()
        },
        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    }

    function deleteNote(noteSequence: number): void {
      bulmaJS.confirm({
        title: 'Delete Note',
        message: 'Are you sure you want to delete this note?',
        contextualColorName: 'danger',
        okButton: {
          text: 'Delete',
          callbackFunction: () => {
            cityssm.postJSON(
              `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderNote`,
              {
                workOrderId,
                noteSequence
              },
              (responseJSON) => {
                if (responseJSON.success) {
                  loadNotes()
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Failed to delete note.'
                  })
                }
              }
            )
          }
        }
      })
    }

    function loadNotes(): void {
      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderNotes`,
        {},
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            notes: WorkOrderNote[]
          }

          if (responseJSON.success) {
            renderNotes(responseJSON.notes)
          }
        }
      )
    }

    // Add note button
    const addNoteButton = document.querySelector(
      '#button--addNote'
    ) as HTMLButtonElement | null
    if (addNoteButton !== null) {
      addNoteButton.addEventListener('click', () => {
        showAddNoteModal()
      })
    }

    // Load notes initially
    loadNotes()
  }
})()
