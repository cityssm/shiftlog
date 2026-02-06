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
        noteTypePanel.className = 'panel mb-5 collapsible-panel'
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
    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doAdd(submitEvent: Event): void {
      submitEvent.preventDefault()

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
    }

    cityssm.openHtmlModal('adminNoteTypes-add', {
      onshow(modalElement) {
        formElement = modalElement.querySelector('form') as HTMLFormElement

        const userGroupSelect = formElement.querySelector(
          '#noteTypeAdd--userGroupId'
        ) as HTMLSelectElement

        for (const group of userGroups) {
          const option = document.createElement('option')
          option.value = group.userGroupId.toString()
          option.textContent = group.userGroupName
          userGroupSelect.append(option)
        }

        formElement.addEventListener('submit', doAdd)
      },
      onshown(modalElement, _closeModalFunction) {
        closeModalFunction = _closeModalFunction
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#noteTypeAdd--noteType'
          ) as HTMLInputElement
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doUpdate(submitEvent: Event): void {
      submitEvent.preventDefault()

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
    }

    cityssm.openHtmlModal('adminNoteTypes-edit', {
      onshow(modalElement) {
        formElement = modalElement.querySelector('form') as HTMLFormElement
        ;(
          formElement.querySelector(
            '#noteTypeEdit--noteTypeId'
          ) as HTMLInputElement
        ).value = noteType.noteTypeId.toString()
        ;(
          formElement.querySelector(
            '#noteTypeEdit--noteType'
          ) as HTMLInputElement
        ).value = noteType.noteType

        const userGroupSelect = formElement.querySelector(
          '#noteTypeEdit--userGroupId'
        ) as HTMLSelectElement

        for (const group of userGroups) {
          const option = document.createElement('option')
          option.value = group.userGroupId.toString()
          option.textContent = group.userGroupName
          if (group.userGroupId === noteType.userGroupId) {
            option.selected = true
          }
          userGroupSelect.append(option)
        }

        ;(
          formElement.querySelector(
            'input[name="isAvailableWorkOrders"]'
          ) as HTMLInputElement
        ).checked = noteType.isAvailableWorkOrders
        ;(
          formElement.querySelector(
            'input[name="isAvailableShifts"]'
          ) as HTMLInputElement
        ).checked = noteType.isAvailableShifts
        ;(
          formElement.querySelector(
            'input[name="isAvailableTimesheets"]'
          ) as HTMLInputElement
        ).checked = noteType.isAvailableTimesheets

        formElement.addEventListener('submit', doUpdate)
      },
      onshown(modalElement, _closeModalFunction) {
        closeModalFunction = _closeModalFunction
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#noteTypeEdit--noteType'
          ) as HTMLInputElement
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doAdd(submitEvent: Event): void {
      submitEvent.preventDefault()

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
    }

    cityssm.openHtmlModal('adminNoteTypes-addField', {
      onshow(modalElement) {
        formElement = modalElement.querySelector('form') as HTMLFormElement
        ;(
          formElement.querySelector(
            '#fieldAdd--noteTypeId'
          ) as HTMLInputElement
        ).value = noteTypeId.toString()

        const dataListSelect = formElement.querySelector(
          '#fieldAdd--dataListKey'
        ) as HTMLSelectElement

        for (const list of dataLists) {
          const option = document.createElement('option')
          option.value = list.dataListKey
          option.textContent = list.dataListName
          dataListSelect.append(option)
        }

        const fieldTypeSelect = formElement.querySelector(
          '#fieldAdd--fieldInputType'
        ) as HTMLSelectElement
        const dataListField = formElement.querySelector(
          '#field--dataListKey'
        ) as HTMLDivElement
        const minMaxFields = formElement.querySelector(
          '#fields--minMax'
        ) as HTMLDivElement

        function updateFieldVisibility(): void {
          const fieldType = fieldTypeSelect.value

          if (fieldType === 'text' || fieldType === 'select') {
            dataListField.classList.remove('is-hidden')
          } else {
            dataListField.classList.add('is-hidden')
          }

          if (fieldType === 'text' || fieldType === 'number') {
            minMaxFields.classList.remove('is-hidden')
          } else {
            minMaxFields.classList.add('is-hidden')
          }
        }

        fieldTypeSelect.addEventListener('change', updateFieldVisibility)
        updateFieldVisibility()

        formElement.addEventListener('submit', doAdd)
      },
      onshown(modalElement, _closeModalFunction) {
        closeModalFunction = _closeModalFunction
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#fieldAdd--fieldLabel'
          ) as HTMLInputElement
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doUpdate(submitEvent: Event): void {
      submitEvent.preventDefault()

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
    }

    cityssm.openHtmlModal('adminNoteTypes-editField', {
      onshow(modalElement) {
        formElement = modalElement.querySelector('form') as HTMLFormElement
        ;(
          formElement.querySelector(
            '#fieldEdit--noteTypeFieldId'
          ) as HTMLInputElement
        ).value = field.noteTypeFieldId.toString()
        ;(
          formElement.querySelector(
            '#fieldEdit--fieldLabel'
          ) as HTMLInputElement
        ).value = field.fieldLabel

        const fieldTypeSelect = formElement.querySelector(
          '#fieldEdit--fieldInputType'
        ) as HTMLSelectElement
        fieldTypeSelect.value = field.fieldInputType

        const dataListSelect = formElement.querySelector(
          '#fieldEdit--dataListKey'
        ) as HTMLSelectElement

        for (const list of dataLists) {
          const option = document.createElement('option')
          option.value = list.dataListKey
          option.textContent = list.dataListName
          if (list.dataListKey === field.dataListKey) {
            option.selected = true
          }
          dataListSelect.append(option)
        }

        ;(
          formElement.querySelector(
            '#fieldEdit--fieldValueMin'
          ) as HTMLInputElement
        ).value = field.fieldValueMin?.toString() ?? ''
        ;(
          formElement.querySelector(
            '#fieldEdit--fieldValueMax'
          ) as HTMLInputElement
        ).value = field.fieldValueMax?.toString() ?? ''
        ;(
          formElement.querySelector(
            '#fieldEdit--fieldHelpText'
          ) as HTMLTextAreaElement
        ).value = field.fieldHelpText
        ;(
          formElement.querySelector(
            'input[name="fieldValueRequired"]'
          ) as HTMLInputElement
        ).checked = field.fieldValueRequired
        ;(
          formElement.querySelector(
            'input[name="hasDividerAbove"]'
          ) as HTMLInputElement
        ).checked = field.hasDividerAbove

        const dataListField = formElement.querySelector(
          '#field--dataListKey'
        ) as HTMLDivElement
        const minMaxFields = formElement.querySelector(
          '#fields--minMax'
        ) as HTMLDivElement

        function updateFieldVisibility(): void {
          const fieldType = fieldTypeSelect.value

          if (fieldType === 'text' || fieldType === 'select') {
            dataListField.classList.remove('is-hidden')
          } else {
            dataListField.classList.add('is-hidden')
          }

          if (fieldType === 'text' || fieldType === 'number') {
            minMaxFields.classList.remove('is-hidden')
          } else {
            minMaxFields.classList.add('is-hidden')
          }
        }

        fieldTypeSelect.addEventListener('change', updateFieldVisibility)
        updateFieldVisibility()

        formElement.addEventListener('submit', doUpdate)
      },
      onshown(modalElement, _closeModalFunction) {
        closeModalFunction = _closeModalFunction
        bulmaJS.toggleHtmlClipped()
        ;(
          modalElement.querySelector(
            '#fieldEdit--fieldLabel'
          ) as HTMLInputElement
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
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
