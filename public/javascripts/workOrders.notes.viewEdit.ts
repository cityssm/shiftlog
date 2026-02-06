/* eslint-disable max-lines -- complex client-side module with note type field handling */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'
import type { WorkOrderNote } from '../../database/workOrders/getWorkOrderNotes.js'
import type { DoCreateWorkOrderNoteResponse } from '../../handlers/workOrders-post/doCreateWorkOrderNote.js'
import type { DoDeleteWorkOrderNoteResponse } from '../../handlers/workOrders-post/doDeleteWorkOrderNote.js'
import type { DoGetNoteTypesResponse } from '../../handlers/workOrders-post/doGetNoteTypes.js'
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

  let noteTypes: NoteTypeWithFields[] = []

  const notesContainerElement = document.querySelector(
    '#container--notes'
  ) as HTMLElement

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive check for null
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

      const noteTypeLabel =
        note.noteType !== null && note.noteType !== undefined
          ? `<span class="tag is-info is-light">${cityssm.escapeHTML(note.noteType)}</span>`
          : ''

      // Render field values if present
      let fieldsHTML = ''
      if (note.fields !== undefined && note.fields.length > 0) {
        fieldsHTML = `
          <div class="content mt-2">
            <table class="table is-narrow is-size-7">
              <tbody>
                ${note.fields
                  .map(
                    (field) => `
                  <tr>
                    <th style="width: 35%;">${cityssm.escapeHTML(field.fieldLabel)}</th>
                    <td>${cityssm.escapeHTML(field.fieldValue)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
      }

      // eslint-disable-next-line no-unsanitized/property -- content is sanitized via cityssm.escapeHTML
      noteElement.innerHTML = /* html */ `
        <article class="media">
          <div class="media-content">
            <div class="content">
              <p>
                <strong>${cityssm.escapeHTML(note.recordCreate_userName)}</strong>
                <small>${cityssm.dateToString(new Date(note.recordCreate_dateTime))}</small>
                ${noteTypeLabel}
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
              ${fieldsHTML}
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

        // Show note type if present
        const noteTypeContainer = modalElement.querySelector(
          '#viewWorkOrderNote--noteTypeContainer'
        ) as HTMLElement
        if (note.noteType !== null && note.noteType !== undefined) {
          ;(
            modalElement.querySelector(
              '#viewWorkOrderNote--noteType'
            ) as HTMLElement
          ).textContent = note.noteType
          noteTypeContainer.style.display = 'block'
        } else {
          noteTypeContainer.style.display = 'none'
        }

        ;(
          modalElement.querySelector(
            '#viewWorkOrderNote--noteText'
          ) as HTMLElement
        ).textContent = note.noteText

        // Render fields if present
        const fieldsContainer = modalElement.querySelector(
          '#viewWorkOrderNote--fieldsContainer'
        ) as HTMLElement
        fieldsContainer.innerHTML = ''
        if (note.fields !== undefined && note.fields.length > 0) {
          // eslint-disable-next-line no-unsanitized/property -- content is sanitized via cityssm.escapeHTML
          fieldsContainer.innerHTML = `
            <div class="content mt-4">
              <h6 class="title is-6">Additional Information</h6>
              <table class="table is-fullwidth is-striped">
                <tbody>
                  ${note.fields
                    .map(
                      (field) => `
                    <tr>
                      <th style="width: 40%;">${cityssm.escapeHTML(field.fieldLabel)}</th>
                      <td>${cityssm.escapeHTML(field.fieldValue)}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          `
        }
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
      const formData = new FormData(formElement)

      // Extract field values and construct proper structure
      const noteData: {
        workOrderId: string
        noteSequence: string
        noteText: string
        fields?: Record<string, string>
      } = {
        workOrderId: formData.get('workOrderId') as string,
        noteSequence: formData.get('noteSequence') as string,
        noteText: formData.get('noteText') as string
      }

      // Extract fields with pattern fields[noteTypeFieldId]
      const fields: Record<string, string> = {}
      for (const [key, value] of formData.entries()) {
        const match = /^fields\[(\d+)\]$/.exec(key)
        if (match !== null && typeof value === 'string') {
          fields[match[1]] = value
        }
      }

      if (Object.keys(fields).length > 0) {
        noteData.fields = fields
      }

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderNote`,
        noteData,
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

    function renderEditFieldsWithDataLists(
      fields: WorkOrderNoteField[],
      dataListMap: Map<string, Array<{ dataListItem: string }>>,
      fieldsContainer: HTMLElement
    ): void {
      let fieldsHTML = ''
      for (const field of fields) {
        const fieldName = `fields[${field.noteTypeFieldId}]`
        const requiredAttribute = field.fieldValueRequired === true ? 'required' : ''
        const helpText = field.fieldHelpText !== undefined && field.fieldHelpText !== '' 
          ? `<p class="help">${cityssm.escapeHTML(field.fieldHelpText)}</p>` 
          : ''
        
        fieldsHTML += `<div class="field">`
        fieldsHTML += `<label class="label" for="editWorkOrderNote--field-${field.noteTypeFieldId}">
            ${cityssm.escapeHTML(field.fieldLabel)}
            ${field.fieldValueRequired === true ? '<span class="has-text-danger">*</span>' : ''}
          </label>`

        // Render appropriate input based on field type
        switch (field.fieldInputType) {
          case 'date': {
            fieldsHTML += `
              <div class="control">
                <input class="input" type="date" 
                  id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  value="${cityssm.escapeHTML(field.fieldValue)}"
                  ${requiredAttribute} />
              </div>
            `
            break
          }
          case 'number': {
            const minAttribute = field.fieldValueMin !== null && field.fieldValueMin !== undefined
              ? `min="${field.fieldValueMin}"` : ''
            const maxAttribute = field.fieldValueMax !== null && field.fieldValueMax !== undefined
              ? `max="${field.fieldValueMax}"` : ''
            fieldsHTML += `
              <div class="control">
                <input class="input" type="number" 
                  id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  value="${cityssm.escapeHTML(field.fieldValue)}"
                  ${minAttribute} ${maxAttribute} ${requiredAttribute} />
              </div>
            `
            break
          }
          case 'select': {
            // Populate select with data list items
            const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
              ? dataListMap.get(field.dataListKey) ?? []
              : []
            
            fieldsHTML += `
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}" 
                    ${requiredAttribute}>
                    <option value="">-- Select --</option>
                    ${dataListItems.map((item) => {
                      const selected = item.dataListItem === field.fieldValue ? 'selected' : ''
                      return `<option value="${cityssm.escapeHTML(item.dataListItem)}" ${selected}>${cityssm.escapeHTML(item.dataListItem)}</option>`
                    }).join('')}
                  </select>
                </div>
              </div>
            `
            break
          }
          case 'text': {
            // If field has a data list, add datalist element
            const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
              ? dataListMap.get(field.dataListKey) ?? []
              : []
            
            const dataListAttr = dataListItems.length > 0 
              ? `list="datalist-edit-${field.noteTypeFieldId}"` 
              : ''
            
            fieldsHTML += `
              <div class="control">
                <input class="input" type="text" 
                  id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  value="${cityssm.escapeHTML(field.fieldValue)}"
                  ${dataListAttr}
                  ${requiredAttribute} />
              </div>
            `
            
            // Add datalist element if applicable
            if (dataListItems.length > 0) {
              fieldsHTML += `
                <datalist id="datalist-edit-${field.noteTypeFieldId}">
                  ${dataListItems.map((item) => 
                    `<option value="${cityssm.escapeHTML(item.dataListItem)}"></option>`
                  ).join('')}
                </datalist>
              `
            }
            break
          }
          case 'textbox': {
            fieldsHTML += `
              <div class="control">
                <textarea class="textarea" rows="3"
                  id="editWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}"
                  ${requiredAttribute}>${cityssm.escapeHTML(field.fieldValue)}</textarea>
              </div>
            `
            break
          }
        }

        fieldsHTML += helpText
        fieldsHTML += `</div>`
      }
      
      // eslint-disable-next-line no-unsanitized/property -- content is sanitized via cityssm.escapeHTML
      fieldsContainer.innerHTML = fieldsHTML
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

        // Show note type if present
        const noteTypeContainer = modalElement.querySelector(
          '#editWorkOrderNote--noteTypeContainer'
        ) as HTMLElement
        if (note.noteType !== null && note.noteType !== undefined) {
          ;(
            modalElement.querySelector(
              '#editWorkOrderNote--noteType'
            ) as HTMLElement
          ).textContent = note.noteType
          noteTypeContainer.style.display = 'block'
        } else {
          noteTypeContainer.style.display = 'none'
        }

        // Render fields if present
        const fieldsContainer = modalElement.querySelector(
          '#editWorkOrderNote--fieldsContainer'
        ) as HTMLElement
        
        if (note.fields !== undefined && note.fields.length > 0) {
          // Collect all unique data list keys
          const dataListKeys = new Set<string>()
          for (const field of note.fields) {
            if (field.dataListKey !== null && field.dataListKey !== undefined) {
              dataListKeys.add(field.dataListKey)
            }
          }

          // Load data list items if needed
          if (dataListKeys.size > 0) {
            const dataListPromises = Array.from(dataListKeys).map((key) =>
              fetch(
                `${exports.shiftLog.urlPrefix}/api/${exports.shiftLog.apiKey}/dataListItems/${key}`
              )
                .then((response) => response.json())
                .then((data) => ({ key, items: data as Array<{ dataListItem: string }> }))
            )

            Promise.all(dataListPromises)
              .then((dataLists) => {
                const dataListMap = new Map<string, Array<{ dataListItem: string }>>()
                for (const dl of dataLists) {
                  dataListMap.set(dl.key, dl.items)
                }
                renderEditFieldsWithDataLists(note.fields ?? [], dataListMap, fieldsContainer)
              })
              .catch(() => {
                // If data list loading fails, render without data lists
                renderEditFieldsWithDataLists(note.fields ?? [], new Map(), fieldsContainer)
              })
          } else {
            renderEditFieldsWithDataLists(note.fields, new Map(), fieldsContainer)
          }
        } else {
          fieldsContainer.innerHTML = ''
        }
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

    function renderNoteTypeFields(selectedNoteTypeId: string): void {
      const fieldsContainer = document.querySelector(
        '#addWorkOrderNote--fieldsContainer'
      ) as HTMLElement

      if (selectedNoteTypeId === '') {
        fieldsContainer.innerHTML = ''
        return
      }

      const selectedNoteType = noteTypes.find(
        (nt) => nt.noteTypeId.toString() === selectedNoteTypeId
      )

      if (selectedNoteType === undefined || selectedNoteType.fields.length === 0) {
        fieldsContainer.innerHTML = ''
        return
      }

      // Collect all unique data list keys
      const dataListKeys = new Set<string>()
      for (const field of selectedNoteType.fields) {
        if (field.dataListKey !== null && field.dataListKey !== undefined) {
          dataListKeys.add(field.dataListKey)
        }
      }

      // Load data list items if needed
      if (dataListKeys.size > 0) {
        const dataListPromises = Array.from(dataListKeys).map((key) =>
          fetch(
            `${exports.shiftLog.urlPrefix}/api/${exports.shiftLog.apiKey}/dataListItems/${key}`
          )
            .then((response) => response.json())
            .then((data) => ({ key, items: data as Array<{ dataListItem: string }> }))
        )

        Promise.all(dataListPromises)
          .then((dataLists) => {
            const dataListMap = new Map<string, Array<{ dataListItem: string }>>()
            for (const dl of dataLists) {
              dataListMap.set(dl.key, dl.items)
            }
            renderFieldsWithDataLists(selectedNoteType, dataListMap, fieldsContainer)
          })
          .catch(() => {
            // If data list loading fails, render without data lists
            renderFieldsWithDataLists(selectedNoteType, new Map(), fieldsContainer)
          })
      } else {
        renderFieldsWithDataLists(selectedNoteType, new Map(), fieldsContainer)
      }
    }

    function renderFieldsWithDataLists(
      selectedNoteType: NoteTypeWithFields,
      dataListMap: Map<string, Array<{ dataListItem: string }>>,
      fieldsContainer: HTMLElement
    ): void {
      let fieldsHTML = ''
      for (const field of selectedNoteType.fields) {
        if (field.hasDividerAbove) {
          fieldsHTML += `<hr class="mt-4 mb-4" />`
        }

        const fieldName = `fields[${field.noteTypeFieldId}]`
        const requiredAttribute = field.fieldValueRequired ? 'required' : ''
        const helpText = field.fieldHelpText === '' 
          ? '' 
          : `<p class="help">${cityssm.escapeHTML(field.fieldHelpText)}</p>`

        fieldsHTML += `<div class="field">`
        fieldsHTML += `<label class="label" for="addWorkOrderNote--field-${field.noteTypeFieldId}">
            ${cityssm.escapeHTML(field.fieldLabel)}
            ${field.fieldValueRequired ? '<span class="has-text-danger">*</span>' : ''}
          </label>`

        switch (field.fieldInputType) {
          case 'date': {
            fieldsHTML += `
              <div class="control">
                <input class="input" type="date" 
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${requiredAttribute} />
              </div>
            `
            break
          }
          case 'number': {
            const minAttribute = field.fieldValueMin === null ? '' : `min="${field.fieldValueMin}"`
            const maxAttribute = field.fieldValueMax === null ? '' : `max="${field.fieldValueMax}"`
            fieldsHTML += `
              <div class="control">
                <input class="input" type="number" 
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${minAttribute} ${maxAttribute} ${requiredAttribute} />
              </div>
            `
            break
          }
          case 'select': {
            // Populate select with data list items
            const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
              ? dataListMap.get(field.dataListKey) ?? []
              : []
            
            fieldsHTML += `
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                    name="${fieldName}" 
                    ${requiredAttribute}>
                    <option value="">-- Select --</option>
                    ${dataListItems.map((item) => 
                      `<option value="${cityssm.escapeHTML(item.dataListItem)}">${cityssm.escapeHTML(item.dataListItem)}</option>`
                    ).join('')}
                  </select>
                </div>
              </div>
            `
            break
          }
          case 'text': {
            // If field has a data list, add datalist element
            const dataListItems = field.dataListKey !== null && field.dataListKey !== undefined
              ? dataListMap.get(field.dataListKey) ?? []
              : []
            
            const dataListAttr = dataListItems.length > 0 
              ? `list="datalist-${field.noteTypeFieldId}"` 
              : ''
            
            fieldsHTML += `
              <div class="control">
                <input class="input" type="text" 
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${dataListAttr}
                  ${requiredAttribute} />
              </div>
            `
            
            // Add datalist element if applicable
            if (dataListItems.length > 0) {
              fieldsHTML += `
                <datalist id="datalist-${field.noteTypeFieldId}">
                  ${dataListItems.map((item) => 
                    `<option value="${cityssm.escapeHTML(item.dataListItem)}"></option>`
                  ).join('')}
                </datalist>
              `
            }
            break
          }
          case 'textbox': {
            fieldsHTML += `
              <div class="control">
                <textarea class="textarea" rows="3"
                  id="addWorkOrderNote--field-${field.noteTypeFieldId}"
                  name="${fieldName}" 
                  ${requiredAttribute}></textarea>
              </div>
            `
            break
          }
        }

        fieldsHTML += helpText
        fieldsHTML += `</div>`
      }

      // eslint-disable-next-line no-unsanitized/property -- content is sanitized via cityssm.escapeHTML
      fieldsContainer.innerHTML = fieldsHTML
    }

    function doAddNote(submitEvent: Event): void {
      submitEvent.preventDefault()
      const formElement = submitEvent.currentTarget as HTMLFormElement
      const formData = new FormData(formElement)

      // Extract field values and construct proper structure
      const noteData: {
        workOrderId: string
        noteTypeId?: string
        noteText: string
        fields?: Record<string, string>
      } = {
        workOrderId: formData.get('workOrderId') as string,
        noteText: formData.get('noteText') as string
      }

      const noteTypeId = formData.get('noteTypeId') as string
      if (noteTypeId !== null && noteTypeId !== '') {
        noteData.noteTypeId = noteTypeId
      }

      // Extract fields with pattern fields[noteTypeFieldId]
      const fields: Record<string, string> = {}
      for (const [key, value] of formData.entries()) {
        const match = /^fields\[(\d+)\]$/.exec(key)
        if (match !== null && typeof value === 'string') {
          fields[match[1]] = value
        }
      }

      if (Object.keys(fields).length > 0) {
        noteData.fields = fields
      }

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderNote`,
        noteData,
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

        // Populate note types dropdown
        const noteTypeSelect = modalElement.querySelector(
          '#addWorkOrderNote--noteTypeId'
        ) as HTMLSelectElement
        for (const noteType of noteTypes) {
          const option = document.createElement('option')
          option.value = noteType.noteTypeId.toString()
          option.textContent = noteType.noteType
          noteTypeSelect.append(option)
        }

        // Add event listener for note type change
        noteTypeSelect.addEventListener('change', () => {
          renderNoteTypeFields(noteTypeSelect.value)
        })
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

  function loadNoteTypes(): void {
    cityssm.postJSON(
      `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doGetNoteTypes`,
      {},
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as unknown as DoGetNoteTypesResponse
        noteTypes = responseJSON.noteTypes
      }
    )
  }

  // Add note button
  document
    .querySelector('#button--addNote')
    ?.addEventListener('click', showAddNoteModal)

  // Load note types and notes initially
  loadNoteTypes()
  loadNotes()
})()
