import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { WorkOrderNote } from '../../database/workOrders/getWorkOrderNotes.js'
import type { DoCreateWorkOrderNoteResponse } from '../../handlers/workOrders-post/doCreateWorkOrderNote.js'
import type { DoDeleteWorkOrderNoteResponse } from '../../handlers/workOrders-post/doDeleteWorkOrderNote.js'
import type { DoGetWorkOrderNotesResponse } from '../../handlers/workOrders-post/doGetWorkOrderNotes.js'
import type { DoUpdateWorkOrderNoteResponse } from '../../handlers/workOrders-post/doUpdateWorkOrderNote.js'

import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal

  isEdit: boolean
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
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
   * Notes functionality
   */

  const notesContainerElement = document.querySelector(
    '#container--notes'
  ) as HTMLElement

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (notesContainerElement === null) {
    return
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text
    }
    return `${text.slice(0, maxLength)}…`
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
        exports.isEdit &&
        (exports.shiftLog.userCanManageWorkOrders ||
          note.recordCreate_userName === exports.shiftLog.userName)

      const truncatedText = truncateText(note.noteText, 200)
      const needsExpand = note.noteText.length > 200

      // eslint-disable-next-line no-unsanitized/property
      noteElement.innerHTML = /* html */ `
        <article class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong>
                <small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small>
                ${
                  note.recordUpdate_dateTime === note.recordCreate_dateTime
                    ? ''
                    : '<small class="has-text-grey">(edited)</small>'
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
          </div>
          ${
            canEdit
              ? /* html */ `
                <div class="media-right">
                  <div class="buttons">
                    <button
                      class="button is-small edit-note"
                      data-note-sequence="${note.noteSequence}"
                      type="button"
                      title="Edit Note"
                    >
                      <span class="icon is-small"><i class="fa-solid fa-edit"></i></span>
                      <span>Edit Note</span>
                    </button>
                    <button
                      class="button is-small is-light is-danger delete-note"
                      data-note-sequence="${note.noteSequence}"
                      type="button"
                      title="Delete Note"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
                </div>
              `
              : ''
          }
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
    cityssm.openHtmlModal('workOrders-viewNote', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#viewWorkOrderNote--userName'
          ) as HTMLElement
        ).textContent = note.recordCreate_userName
        ;(
          modalElement.querySelector(
            '#viewWorkOrderNote--dateTime'
          ) as HTMLElement
        ).textContent = cityssm.dateToString(
          new Date(note.recordCreate_dateTime)
        )
        ;(
          modalElement.querySelector(
            '#viewWorkOrderNote--noteText'
          ) as HTMLElement
        ).textContent = note.noteText
      },
      onshown(_modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function showEditNoteModal(note: WorkOrderNote): void {
    let closeModalFunction: () => void

    function doUpdateNote(submitEvent: Event): void {
      submitEvent.preventDefault()
      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderNote`,
        formElement,
        (responseJSON: DoUpdateWorkOrderNoteResponse) => {
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
        exports.shiftLog.setUnsavedChanges('modal')
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
        exports.shiftLog.clearUnsavedChanges('modal')
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function showAddNoteModal(event?: Event): void {
    event?.preventDefault()

    let closeModalFunction: () => void

    function doAddNote(submitEvent: Event): void {
      submitEvent.preventDefault()
      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderNote`,
        formElement,
        (responseJSON: DoCreateWorkOrderNoteResponse) => {
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
        exports.shiftLog.populateSectionAliases(modalElement)
        exports.shiftLog.setUnsavedChanges('modal')
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
        ).focus()
      },

      onremoved() {
        exports.shiftLog.clearUnsavedChanges('modal')
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteNote(noteSequence: number): void {
    bulmaJS.confirm({
      contextualColorName: 'danger',
      title: 'Delete Note',

      message: 'Are you sure you want to delete this note?',
      okButton: {
        text: 'Delete',

        callbackFunction: () => {
          cityssm.postJSON(
            `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderNote`,
            {
              workOrderId,
              noteSequence
            },
            (responseJSON: DoDeleteWorkOrderNoteResponse) => {
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
      (responseJSON: DoGetWorkOrderNotesResponse) => {
        renderNotes(responseJSON.notes)
      }
    )
  }

  // Add note button
  document
    .querySelector('#button--addNote')
    ?.addEventListener('click', showAddNoteModal)

  // Load notes initially
  loadNotes()
})()
