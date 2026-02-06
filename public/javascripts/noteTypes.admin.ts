// @ts-nocheck
/* eslint-disable max-lines -- Complex admin interface with multiple modals */
/* eslint-disable no-unsanitized/property -- Using cityssm.escapeHTML() for sanitization */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddNoteTypeFieldResponse } from '../../handlers/admin-post/doAddNoteTypeField.js'
import type { DoDeleteNoteTypeFieldResponse } from '../../handlers/admin-post/doDeleteNoteTypeField.js'
import type { DoUpdateNoteTypeFieldResponse } from '../../handlers/admin-post/doUpdateNoteTypeField.js'
import type { DoAddNoteTypeResponse } from '../../handlers/admin-post/doAddNoteType.js'
import type { DoDeleteNoteTypeResponse } from '../../handlers/admin-post/doDeleteNoteType.js'
import type { DoUpdateNoteTypeResponse } from '../../handlers/admin-post/doUpdateNoteType.js'
import type { NoteTypeWithFields } from '../../database/noteTypes/getNoteTypes.js'
import type { DataList } from '../../database/app/getDataLists.js'
import type { UserGroup } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
  noteTypes: NoteTypeWithFields[]
  userGroups: UserGroup[]
  dataLists: DataList[]
}
;(() => {
  const shiftLog = exports.shiftLog
  const noteTypesContainerElement = document.querySelector(
    '#container--noteTypes'
  ) as HTMLDivElement

  let noteTypes = exports.noteTypes
  const userGroups = exports.userGroups
  const dataLists = exports.dataLists

  function renderNoteTypes(): void {
    const panelElement = document.createElement('div')
    panelElement.className = 'panel'

    if (noteTypes.length === 0) {
      panelElement.innerHTML = `<div class="panel-block">
        <div class="message is-info">
          <p class="message-body">
            <strong>No note types available.</strong><br />
            Click "Add Note Type" to create your first note type.
          </p>
        </div>
      </div>`
    } else {
      for (const noteType of noteTypes) {
        const noteTypePanel = document.createElement('details')
        noteTypePanel.className = 'panel mb-5 collapsable-panel'
        noteTypePanel.dataset.noteTypeId = noteType.noteTypeId.toString()

        const summaryElement = document.createElement('summary')
        summaryElement.className = 'panel-heading is-clickable'

        const availabilityBadges: string[] = []
        if (noteType.isAvailableWorkOrders) {
          availabilityBadges.push('<span class="tag is-info is-light">Work Orders</span>')
        }
        if (noteType.isAvailableShifts) {
          availabilityBadges.push('<span class="tag is-info is-light">Shifts</span>')
        }
        if (noteType.isAvailableTimesheets) {
          availabilityBadges.push('<span class="tag is-info is-light">Timesheets</span>')
        }

        summaryElement.innerHTML = `
          <span class="icon-text">
            <span class="icon">
              <i class="fa-solid fa-chevron-right details-chevron"></i>
            </span>
            <span class="has-text-weight-semibold mr-2">
              ${cityssm.escapeHTML(noteType.noteType)}
            </span>
            <span class="tag is-rounded">
              ${noteType.fields.length} ${noteType.fields.length === 1 ? 'field' : 'fields'}
            </span>
            ${availabilityBadges.length > 0 ? `<span class="ml-2">${availabilityBadges.join(' ')}</span>` : ''}
          </span>`

        noteTypePanel.append(summaryElement)

        // Action buttons panel
        const actionBlock = document.createElement('div')
        actionBlock.className = 'panel-block is-justify-content-space-between'
        actionBlock.innerHTML = `
          <div>
            <button class="button is-small is-light button--editNoteType" data-note-type-id="${noteType.noteTypeId}" type="button">
              <span class="icon"><i class="fa-solid fa-pencil"></i></span>
              <span>Edit Note Type</span>
            </button>
          </div>
          <div>
            <button class="button is-success is-small button--addField" data-note-type-id="${noteType.noteTypeId}" type="button">
              <span class="icon"><i class="fa-solid fa-plus"></i></span>
              <span>Add Field</span>
            </button>
            <button class="button is-danger is-small button--deleteNoteType" data-note-type-id="${noteType.noteTypeId}" type="button">
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
              <span>Delete</span>
            </button>
          </div>`

        noteTypePanel.append(actionBlock)

        // Fields table
        const tableBlock = document.createElement('div')
        tableBlock.className = 'panel-block p-0'

        if (noteType.fields.length === 0) {
          tableBlock.innerHTML = `
            <div class="box m-3" style="width: 100%;">
              <p class="has-text-grey has-text-centered">
                No fields defined. Click "Add Field" to create fields for this note type.
              </p>
            </div>`
        } else {
          let tableHTML = `
            <div class="table-container" style="width: 100%;">
              <table class="table is-striped is-hoverable is-fullwidth mb-0">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Type</th>
                    <th>Help Text</th>
                    <th>Required</th>
                    <th class="has-text-centered" style="width: 150px;">Actions</th>
                  </tr>
                </thead>
                <tbody>`

          for (const field of noteType.fields) {
            tableHTML += `
              <tr data-field-id="${field.noteTypeFieldId}">
                <td>${cityssm.escapeHTML(field.fieldLabel)}</td>
                <td><span class="tag">${cityssm.escapeHTML(field.fieldInputType)}</span></td>
                <td class="is-size-7">${cityssm.escapeHTML(field.fieldHelpText)}</td>
                <td class="has-text-centered">
                  ${field.fieldValueRequired ? '<i class="fa-solid fa-check has-text-success"></i>' : ''}
                </td>
                <td class="has-text-centered">
                  <button class="button is-small is-light button--editField" 
                    data-note-type-field-id="${field.noteTypeFieldId}" 
                    data-note-type-id="${noteType.noteTypeId}" 
                    type="button">
                    <span class="icon"><i class="fa-solid fa-pencil"></i></span>
                  </button>
                  <button class="button is-small is-danger button--deleteField" 
                    data-note-type-field-id="${field.noteTypeFieldId}" 
                    type="button">
                    <span class="icon"><i class="fa-solid fa-trash"></i></span>
                  </button>
                </td>
              </tr>`
          }

          tableHTML += `
                </tbody>
              </table>
            </div>`

          tableBlock.innerHTML = tableHTML
        }

        noteTypePanel.append(tableBlock)
        panelElement.append(noteTypePanel)
      }
    }

    noteTypesContainerElement.innerHTML = ''
    noteTypesContainerElement.append(panelElement)

    // Attach event listeners
    attachEventListeners()
  }

  function attachEventListeners(): void {
    // Edit Note Type buttons
    const editButtons = noteTypesContainerElement.querySelectorAll('.button--editNoteType')
    for (const button of editButtons) {
      button.addEventListener('click', openEditNoteTypeModal)
    }

    // Delete Note Type buttons
    const deleteButtons = noteTypesContainerElement.querySelectorAll('.button--deleteNoteType')
    for (const button of deleteButtons) {
      button.addEventListener('click', deleteNoteType)
    }

    // Add Field buttons
    const addFieldButtons = noteTypesContainerElement.querySelectorAll('.button--addField')
    for (const button of addFieldButtons) {
      button.addEventListener('click', openAddFieldModal)
    }

    // Edit Field buttons
    const editFieldButtons = noteTypesContainerElement.querySelectorAll('.button--editField')
    for (const button of editFieldButtons) {
      button.addEventListener('click', openEditFieldModal)
    }

    // Delete Field buttons
    const deleteFieldButtons = noteTypesContainerElement.querySelectorAll('.button--deleteField')
    for (const button of deleteFieldButtons) {
      button.addEventListener('click', deleteField)
    }
  }

  function openAddNoteTypeModal(): void {
    let addModalElement: HTMLElement

    function closeModal(): void {
      addModalElement.remove()
    }

    const userGroupOptionsHTML = `<option value="">(Any User Group)</option>` +
      userGroups.map((group) => `<option value="${group.userGroupId}">${cityssm.escapeHTML(group.userGroupName)}</option>`).join('')

    addModalElement = cityssm.openHtmlModal('add-noteType', {
      onshow: (modalElement) => {
        ;(modalElement.querySelector('#noteTypeAdd--noteType') as HTMLInputElement).focus()
      },
      onshown: (_modalElement, closeModalFunction) => {
        const formElement = addModalElement.querySelector('form') as HTMLFormElement

        formElement.addEventListener('submit', (formEvent) => {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doAddNoteType`,
            formElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoAddNoteTypeResponse

              if (responseJSON.success) {
                noteTypes = responseJSON.noteTypes
                closeModalFunction()
                renderNoteTypes()
                bulmaJS.notification({
                  message: 'Note type added successfully.',
                  type: 'success'
                })
              } else {
                bulmaJS.alert({
                  title: 'Error Adding Note Type',
                  message: responseJSON.message
                })
              }
            }
          )
        })
      }
    })

    addModalElement.innerHTML = `
      <form>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Add Note Type</p>
            <button class="delete" type="button" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <label class="label" for="noteTypeAdd--noteType">
                Note Type Name
                <span class="has-text-danger" title="Required">*</span>
              </label>
              <div class="control">
                <input class="input" id="noteTypeAdd--noteType" name="noteType" type="text" required maxlength="100" />
              </div>
            </div>

            <div class="field">
              <label class="label" for="noteTypeAdd--userGroupId">User Group</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="noteTypeAdd--userGroupId" name="userGroupId">
                    ${userGroupOptionsHTML}
                  </select>
                </div>
              </div>
              <p class="help">Restrict this note type to a specific user group.</p>
            </div>

            <div class="field">
              <label class="label">Availability</label>
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="isAvailableWorkOrders" value="1" />
                  Available for Work Orders
                </label>
              </div>
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="isAvailableShifts" value="1" />
                  Available for Shifts
                </label>
              </div>
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="isAvailableTimesheets" value="1" />
                  Available for Timesheets
                </label>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot is-justify-content-end">
            <button class="button is-success" type="submit">
              <span class="icon"><i class="fa-solid fa-save"></i></span>
              <span>Add Note Type</span>
            </button>
            <button class="button" type="button" data-close>Cancel</button>
          </footer>
        </div>
      </form>`
  }

  function openEditNoteTypeModal(clickEvent: Event): void {
    const noteTypeId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.noteTypeId ?? '',
      10
    )
    const noteType = noteTypes.find((nt) => nt.noteTypeId === noteTypeId)

    if (noteType === undefined) {
      return
    }

    let editModalElement: HTMLElement

    function closeModal(): void {
      editModalElement.remove()
    }

    const userGroupOptionsHTML = `<option value="">(Any User Group)</option>` +
      userGroups.map((group) => {
        const selected = group.userGroupId === noteType.userGroupId ? ' selected' : ''
        return `<option value="${group.userGroupId}"${selected}>${cityssm.escapeHTML(group.userGroupName)}</option>`
      }).join('')

    editModalElement = cityssm.openHtmlModal('edit-noteType', {
      onshow: (modalElement) => {
        ;(modalElement.querySelector('#noteTypeEdit--noteType') as HTMLInputElement).focus()
      },
      onshown: (_modalElement, closeModalFunction) => {
        const formElement = editModalElement.querySelector('form') as HTMLFormElement

        formElement.addEventListener('submit', (formEvent) => {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doUpdateNoteType`,
            formElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoUpdateNoteTypeResponse

              if (responseJSON.success) {
                noteTypes = responseJSON.noteTypes
                closeModalFunction()
                renderNoteTypes()
                bulmaJS.notification({
                  message: 'Note type updated successfully.',
                  type: 'success'
                })
              } else {
                bulmaJS.alert({
                  title: 'Error Updating Note Type',
                  message: responseJSON.message
                })
              }
            }
          )
        })
      }
    })

    editModalElement.innerHTML = `
      <form>
        <input type="hidden" name="noteTypeId" value="${noteType.noteTypeId}" />
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Edit Note Type</p>
            <button class="delete" type="button" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <label class="label" for="noteTypeEdit--noteType">
                Note Type Name
                <span class="has-text-danger" title="Required">*</span>
              </label>
              <div class="control">
                <input class="input" id="noteTypeEdit--noteType" name="noteType" type="text" required maxlength="100" value="${cityssm.escapeHTML(noteType.noteType)}" />
              </div>
            </div>

            <div class="field">
              <label class="label" for="noteTypeEdit--userGroupId">User Group</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="noteTypeEdit--userGroupId" name="userGroupId">
                    ${userGroupOptionsHTML}
                  </select>
                </div>
              </div>
              <p class="help">Restrict this note type to a specific user group.</p>
            </div>

            <div class="field">
              <label class="label">Availability</label>
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="isAvailableWorkOrders" value="1" ${noteType.isAvailableWorkOrders ? 'checked' : ''} />
                  Available for Work Orders
                </label>
              </div>
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="isAvailableShifts" value="1" ${noteType.isAvailableShifts ? 'checked' : ''} />
                  Available for Shifts
                </label>
              </div>
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="isAvailableTimesheets" value="1" ${noteType.isAvailableTimesheets ? 'checked' : ''} />
                  Available for Timesheets
                </label>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot is-justify-content-end">
            <button class="button is-success" type="submit">
              <span class="icon"><i class="fa-solid fa-save"></i></span>
              <span>Save Changes</span>
            </button>
            <button class="button" type="button" data-close>Cancel</button>
          </footer>
        </div>
      </form>`
  }

  function deleteNoteType(clickEvent: Event): void {
    const noteTypeId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.noteTypeId ?? '',
      10
    )
    const noteType = noteTypes.find((nt) => nt.noteTypeId === noteTypeId)

    if (noteType === undefined) {
      return
    }

    bulmaJS.confirm({
      title: 'Delete Note Type',
      message: `Are you sure you want to delete "${cityssm.escapeHTML(noteType.noteType)}"?`,
      contextualColorName: 'danger',
      okButton: {
        text: 'Yes, Delete Note Type',
        callbackFunction: () => {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteNoteType`,
            { noteTypeId },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoDeleteNoteTypeResponse

              if (responseJSON.success) {
                noteTypes = responseJSON.noteTypes
                renderNoteTypes()
                bulmaJS.notification({
                  message: 'Note type deleted successfully.',
                  type: 'success'
                })
              } else {
                bulmaJS.alert({
                  title: 'Error Deleting Note Type',
                  message: responseJSON.message
                })
              }
            }
          )
        }
      }
    })
  }

  function openAddFieldModal(clickEvent: Event): void {
    const noteTypeId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.noteTypeId ?? '',
      10
    )

    let addModalElement: HTMLElement

    function closeModal(): void {
      addModalElement.remove()
    }

    const dataListOptionsHTML = `<option value="">(None)</option>` +
      dataLists.map((list) => `<option value="${cityssm.escapeHTML(list.dataListKey)}">${cityssm.escapeHTML(list.dataListName)}</option>`).join('')

    addModalElement = cityssm.openHtmlModal('add-field', {
      onshow: (modalElement) => {
        ;(modalElement.querySelector('#fieldAdd--fieldLabel') as HTMLInputElement).focus()

        // Handle field type changes
        const fieldTypeSelect = modalElement.querySelector('#fieldAdd--fieldInputType') as HTMLSelectElement
        const dataListField = modalElement.querySelector('#field--dataListKey') as HTMLDivElement
        const minMaxFields = modalElement.querySelector('#fields--minMax') as HTMLDivElement

        function updateFieldVisibility(): void {
          const fieldType = fieldTypeSelect.value
          
          // Show/hide dataListKey for text and select
          if (fieldType === 'text' || fieldType === 'select') {
            dataListField.classList.remove('is-hidden')
          } else {
            dataListField.classList.add('is-hidden')
          }

          // Show/hide min/max for text and number
          if (fieldType === 'text' || fieldType === 'number') {
            minMaxFields.classList.remove('is-hidden')
          } else {
            minMaxFields.classList.add('is-hidden')
          }
        }

        fieldTypeSelect.addEventListener('change', updateFieldVisibility)
        updateFieldVisibility()
      },
      onshown: (_modalElement, closeModalFunction) => {
        const formElement = addModalElement.querySelector('form') as HTMLFormElement

        formElement.addEventListener('submit', (formEvent) => {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doAddNoteTypeField`,
            formElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoAddNoteTypeFieldResponse

              if (responseJSON.success) {
                noteTypes = responseJSON.noteTypes
                closeModalFunction()
                renderNoteTypes()
                bulmaJS.notification({
                  message: 'Field added successfully.',
                  type: 'success'
                })
              } else {
                bulmaJS.alert({
                  title: 'Error Adding Field',
                  message: responseJSON.message
                })
              }
            }
          )
        })
      }
    })

    addModalElement.innerHTML = `
      <form>
        <input type="hidden" name="noteTypeId" value="${noteTypeId}" />
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Add Field</p>
            <button class="delete" type="button" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <label class="label" for="fieldAdd--fieldLabel">
                Field Label
                <span class="has-text-danger" title="Required">*</span>
              </label>
              <div class="control">
                <input class="input" id="fieldAdd--fieldLabel" name="fieldLabel" type="text" required maxlength="100" />
              </div>
            </div>

            <div class="field">
              <label class="label" for="fieldAdd--fieldInputType">
                Field Type
                <span class="has-text-danger" title="Required">*</span>
              </label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="fieldAdd--fieldInputType" name="fieldInputType" required>
                    <option value="text">Text (Single Line)</option>
                    <option value="textbox">Textbox (Multiple Lines)</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select (Dropdown)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field" id="field--dataListKey">
              <label class="label" for="fieldAdd--dataListKey">Data List</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="fieldAdd--dataListKey" name="dataListKey">
                    ${dataListOptionsHTML}
                  </select>
                </div>
              </div>
              <p class="help">For text fields with autocomplete or select dropdowns.</p>
            </div>

            <div id="fields--minMax">
              <div class="columns">
                <div class="column">
                  <div class="field">
                    <label class="label" for="fieldAdd--fieldValueMin">Minimum Value</label>
                    <div class="control">
                      <input class="input" id="fieldAdd--fieldValueMin" name="fieldValueMin" type="number" />
                    </div>
                    <p class="help">For text: min length. For number: min value.</p>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label" for="fieldAdd--fieldValueMax">Maximum Value</label>
                    <div class="control">
                      <input class="input" id="fieldAdd--fieldValueMax" name="fieldValueMax" type="number" />
                    </div>
                    <p class="help">For text: max length. For number: max value.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label" for="fieldAdd--fieldHelpText">Help Text</label>
              <div class="control">
                <textarea class="textarea" id="fieldAdd--fieldHelpText" name="fieldHelpText" maxlength="500"></textarea>
              </div>
              <p class="help">Optional text to help users understand this field.</p>
            </div>

            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="fieldValueRequired" value="1" />
                  Required Field
                </label>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="hasDividerAbove" value="1" />
                  Show Divider Above Field
                </label>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot is-justify-content-end">
            <button class="button is-success" type="submit">
              <span class="icon"><i class="fa-solid fa-save"></i></span>
              <span>Add Field</span>
            </button>
            <button class="button" type="button" data-close>Cancel</button>
          </footer>
        </div>
      </form>`
  }

  function openEditFieldModal(clickEvent: Event): void {
    const fieldId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.noteTypeFieldId ?? '',
      10
    )
    const noteTypeId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.noteTypeId ?? '',
      10
    )

    const noteType = noteTypes.find((nt) => nt.noteTypeId === noteTypeId)
    if (noteType === undefined) {
      return
    }

    const field = noteType.fields.find((f) => f.noteTypeFieldId === fieldId)
    if (field === undefined) {
      return
    }

    let editModalElement: HTMLElement

    function closeModal(): void {
      editModalElement.remove()
    }

    const dataListOptionsHTML = `<option value="">(None)</option>` +
      dataLists.map((list) => {
        const selected = list.dataListKey === field.dataListKey ? ' selected' : ''
        return `<option value="${cityssm.escapeHTML(list.dataListKey)}"${selected}>${cityssm.escapeHTML(list.dataListName)}</option>`
      }).join('')

    const fieldTypeOptionsHTML = [
      { value: 'text', label: 'Text (Single Line)' },
      { value: 'textbox', label: 'Textbox (Multiple Lines)' },
      { value: 'number', label: 'Number' },
      { value: 'date', label: 'Date' },
      { value: 'select', label: 'Select (Dropdown)' }
    ].map((option) => {
      const selected = option.value === field.fieldInputType ? ' selected' : ''
      return `<option value="${option.value}"${selected}>${option.label}</option>`
    }).join('')

    editModalElement = cityssm.openHtmlModal('edit-field', {
      onshow: (modalElement) => {
        ;(modalElement.querySelector('#fieldEdit--fieldLabel') as HTMLInputElement).focus()

        // Handle field type changes
        const fieldTypeSelect = modalElement.querySelector('#fieldEdit--fieldInputType') as HTMLSelectElement
        const dataListField = modalElement.querySelector('#field--dataListKey') as HTMLDivElement
        const minMaxFields = modalElement.querySelector('#fields--minMax') as HTMLDivElement

        function updateFieldVisibility(): void {
          const fieldType = fieldTypeSelect.value
          
          // Show/hide dataListKey for text and select
          if (fieldType === 'text' || fieldType === 'select') {
            dataListField.classList.remove('is-hidden')
          } else {
            dataListField.classList.add('is-hidden')
          }

          // Show/hide min/max for text and number
          if (fieldType === 'text' || fieldType === 'number') {
            minMaxFields.classList.remove('is-hidden')
          } else {
            minMaxFields.classList.add('is-hidden')
          }
        }

        fieldTypeSelect.addEventListener('change', updateFieldVisibility)
        updateFieldVisibility()
      },
      onshown: (_modalElement, closeModalFunction) => {
        const formElement = editModalElement.querySelector('form') as HTMLFormElement

        formElement.addEventListener('submit', (formEvent) => {
          formEvent.preventDefault()

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doUpdateNoteTypeField`,
            formElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoUpdateNoteTypeFieldResponse

              if (responseJSON.success) {
                noteTypes = responseJSON.noteTypes
                closeModalFunction()
                renderNoteTypes()
                bulmaJS.notification({
                  message: 'Field updated successfully.',
                  type: 'success'
                })
              } else {
                bulmaJS.alert({
                  title: 'Error Updating Field',
                  message: responseJSON.message
                })
              }
            }
          )
        })
      }
    })

    editModalElement.innerHTML = `
      <form>
        <input type="hidden" name="noteTypeFieldId" value="${field.noteTypeFieldId}" />
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Edit Field</p>
            <button class="delete" type="button" aria-label="close"></button>
          </header>
          <section class="modal-card-body">
            <div class="field">
              <label class="label" for="fieldEdit--fieldLabel">
                Field Label
                <span class="has-text-danger" title="Required">*</span>
              </label>
              <div class="control">
                <input class="input" id="fieldEdit--fieldLabel" name="fieldLabel" type="text" required maxlength="100" value="${cityssm.escapeHTML(field.fieldLabel)}" />
              </div>
            </div>

            <div class="field">
              <label class="label" for="fieldEdit--fieldInputType">
                Field Type
                <span class="has-text-danger" title="Required">*</span>
              </label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="fieldEdit--fieldInputType" name="fieldInputType" required>
                    ${fieldTypeOptionsHTML}
                  </select>
                </div>
              </div>
            </div>

            <div class="field" id="field--dataListKey">
              <label class="label" for="fieldEdit--dataListKey">Data List</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="fieldEdit--dataListKey" name="dataListKey">
                    ${dataListOptionsHTML}
                  </select>
                </div>
              </div>
              <p class="help">For text fields with autocomplete or select dropdowns.</p>
            </div>

            <div id="fields--minMax">
              <div class="columns">
                <div class="column">
                  <div class="field">
                    <label class="label" for="fieldEdit--fieldValueMin">Minimum Value</label>
                    <div class="control">
                      <input class="input" id="fieldEdit--fieldValueMin" name="fieldValueMin" type="number" value="${field.fieldValueMin ?? ''}" />
                    </div>
                    <p class="help">For text: min length. For number: min value.</p>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label" for="fieldEdit--fieldValueMax">Maximum Value</label>
                    <div class="control">
                      <input class="input" id="fieldEdit--fieldValueMax" name="fieldValueMax" type="number" value="${field.fieldValueMax ?? ''}" />
                    </div>
                    <p class="help">For text: max length. For number: max value.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label" for="fieldEdit--fieldHelpText">Help Text</label>
              <div class="control">
                <textarea class="textarea" id="fieldEdit--fieldHelpText" name="fieldHelpText" maxlength="500">${cityssm.escapeHTML(field.fieldHelpText)}</textarea>
              </div>
              <p class="help">Optional text to help users understand this field.</p>
            </div>

            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="fieldValueRequired" value="1" ${field.fieldValueRequired ? 'checked' : ''} />
                  Required Field
                </label>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" name="hasDividerAbove" value="1" ${field.hasDividerAbove ? 'checked' : ''} />
                  Show Divider Above Field
                </label>
              </div>
            </div>
          </section>
          <footer class="modal-card-foot is-justify-content-end">
            <button class="button is-success" type="submit">
              <span class="icon"><i class="fa-solid fa-save"></i></span>
              <span>Save Changes</span>
            </button>
            <button class="button" type="button" data-close>Cancel</button>
          </footer>
        </div>
      </form>`
  }

  function deleteField(clickEvent: Event): void {
    const fieldId = Number.parseInt(
      (clickEvent.currentTarget as HTMLButtonElement).dataset.noteTypeFieldId ?? '',
      10
    )

    bulmaJS.confirm({
      title: 'Delete Field',
      message: 'Are you sure you want to delete this field?',
      contextualColorName: 'danger',
      okButton: {
        text: 'Yes, Delete Field',
        callbackFunction: () => {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteNoteTypeField`,
            { noteTypeFieldId: fieldId },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoDeleteNoteTypeFieldResponse

              if (responseJSON.success) {
                noteTypes = responseJSON.noteTypes
                renderNoteTypes()
                bulmaJS.notification({
                  message: 'Field deleted successfully.',
                  type: 'success'
                })
              } else {
                bulmaJS.alert({
                  title: 'Error Deleting Field',
                  message: responseJSON.message
                })
              }
            }
          )
        }
      }
    })
  }

  // Initialize
  renderNoteTypes()

  // Add Note Type button
  document.querySelector('#button--addNoteType')?.addEventListener('click', openAddNoteTypeModal)
})()
