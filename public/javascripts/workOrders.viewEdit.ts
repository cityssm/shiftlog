import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { BulmaJS } from '@cityssm/bulma-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

;(() => {
  const workOrderTabsContainerElement = document.querySelector(
    '#container--workOrderTabs'
  )

  if (workOrderTabsContainerElement !== null) {
    exports.shiftLog.initializeRecordTabs(
      workOrderTabsContainerElement as HTMLElement
    )
  }

  /*
   * Notes functionality
   */

  const notesContainerElement = document.querySelector('#container--notes') as HTMLElement | null
  
  if (notesContainerElement !== null) {
    const workOrderFormElement = document.querySelector('#form--workOrder') as HTMLFormElement
    const workOrderId = (workOrderFormElement.querySelector('#workOrder--workOrderId') as HTMLInputElement).value

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
                  ${note.recordUpdate_dateTime !== note.recordCreate_dateTime ? 
                    `<small class="has-text-grey">(edited)</small>` : ''}
                  <br />
                  <span class="note-text">${cityssm.escapeHTML(truncatedText)}</span>
                  ${needsExpand ? 
                    `<a href="#" class="view-full-note" data-note-sequence="${note.noteSequence}">View Full Note</a>` : ''}
                </p>
              </div>
              ${canEdit ? /* html */ `
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
              ` : ''}
            </div>
          </article>
        `

        // Add event listeners
        if (needsExpand) {
          const viewFullLink = noteElement.querySelector('.view-full-note') as HTMLAnchorElement
          viewFullLink.addEventListener('click', (event) => {
            event.preventDefault()
            showFullNoteModal(note)
          })
        }

        if (canEdit) {
          const editLink = noteElement.querySelector('.edit-note') as HTMLAnchorElement
          editLink.addEventListener('click', (event) => {
            event.preventDefault()
            showEditNoteModal(note)
          })

          const deleteLink = noteElement.querySelector('.delete-note') as HTMLAnchorElement
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

      const closeButtons = modalElement.querySelectorAll('.delete, .close-modal, .modal-background')
      for (const button of closeButtons) {
        button.addEventListener('click', () => {
          modalElement.remove()
        })
      }
    }

    function showEditNoteModal(note: WorkOrderNote): void {
      const modalElement = document.createElement('div')
      modalElement.className = 'modal is-active'
      modalElement.innerHTML = /* html */ `
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Edit Note</p>
            <button class="delete" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <form id="form--editNote">
              <input type="hidden" name="workOrderId" value="${workOrderId}" />
              <input type="hidden" name="noteSequence" value="${note.noteSequence}" />
              <div class="field">
                <div class="control">
                  <textarea class="textarea" name="noteText" rows="8" required>${cityssm.escapeHTML(note.noteText)}</textarea>
                </div>
              </div>
            </form>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success save-note">Save</button>
            <button class="button close-modal">Cancel</button>
          </footer>
        </div>
      `

      document.body.append(modalElement)

      const closeButtons = modalElement.querySelectorAll('.delete, .close-modal, .modal-background')
      for (const button of closeButtons) {
        button.addEventListener('click', () => {
          modalElement.remove()
        })
      }

      const saveButton = modalElement.querySelector('.save-note') as HTMLButtonElement
      saveButton.addEventListener('click', () => {
        const formElement = modalElement.querySelector('#form--editNote') as HTMLFormElement
        
        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderNote`,
          formElement,
          (responseJSON) => {
            if (responseJSON.success) {
              modalElement.remove()
              loadNotes()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Failed to update note.'
              })
            }
          }
        )
      })
    }

    function showAddNoteModal(): void {
      const modalElement = document.createElement('div')
      modalElement.className = 'modal is-active'
      modalElement.innerHTML = /* html */ `
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Add Note</p>
            <button class="delete" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <form id="form--addNote">
              <input type="hidden" name="workOrderId" value="${workOrderId}" />
              <div class="field">
                <div class="control">
                  <textarea class="textarea" name="noteText" rows="8" placeholder="Enter note text..." required></textarea>
                </div>
              </div>
            </form>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-success save-note">Add Note</button>
            <button class="button close-modal">Cancel</button>
          </footer>
        </div>
      `

      document.body.append(modalElement)

      const closeButtons = modalElement.querySelectorAll('.delete, .close-modal, .modal-background')
      for (const button of closeButtons) {
        button.addEventListener('click', () => {
          modalElement.remove()
        })
      }

      const saveButton = modalElement.querySelector('.save-note') as HTMLButtonElement
      saveButton.addEventListener('click', () => {
        const formElement = modalElement.querySelector('#form--addNote') as HTMLFormElement
        
        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderNote`,
          formElement,
          (responseJSON) => {
            if (responseJSON.success) {
              modalElement.remove()
              loadNotes()
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                message: 'Failed to add note.'
              })
            }
          }
        )
      })

      // Focus the textarea
      const textarea = modalElement.querySelector('textarea') as HTMLTextAreaElement
      textarea.focus()
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
          const responseJSON = rawResponseJSON as { success: boolean; notes: WorkOrderNote[] }
          
          if (responseJSON.success) {
            renderNotes(responseJSON.notes)
          }
        }
      )
    }

    // Add note button
    const addNoteButton = document.querySelector('#button--addNote') as HTMLButtonElement | null
    if (addNoteButton !== null) {
      addNoteButton.addEventListener('click', () => {
        showAddNoteModal()
      })
    }

    // Load notes initially
    loadNotes()
  }
})()
