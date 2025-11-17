// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type {
  Crew,
  Employee,
  Equipment,
  ShiftCrew,
  ShiftEmployee,
  ShiftEquipment
} from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog
  const urlPrefix = shiftLog.urlPrefix + '/' + shiftLog.shiftsRouter

  const shiftIdElement = document.querySelector(
    '#shift--shiftId'
  ) as HTMLInputElement
  const shiftId = shiftIdElement.value

  const isEdit = document.querySelector('#button--addCrew') !== null

  let shiftCrews: ShiftCrew[] = []
  let shiftEmployees: ShiftEmployee[] = []
  let shiftEquipment: ShiftEquipment[] = []

  let availableCrews: Crew[] = []
  let availableEmployees: Employee[] = []
  let availableEquipment: Equipment[] = []

  function renderShiftCrews(): void {
    const containerElement = document.querySelector(
      '#container--shiftCrews'
    ) as HTMLElement

    if (shiftCrews.length === 0) {
      containerElement.innerHTML = `<div class="message"><div class="message-body">No crews assigned to this shift.</div></div>`
      return
    }

    let html = '<table class="table is-fullwidth is-striped is-hoverable">'
    html += '<thead><tr><th>Crew</th><th>Note</th>'
    if (isEdit) {
      html += '<th class="has-text-right">Actions</th>'
    }
    html += '</tr></thead><tbody>'

    for (const crew of shiftCrews) {
      html += '<tr>'
      html += `<td>${cityssm.escapeHTML(crew.crewName ?? '')}</td>`
      html += `<td><span class="crew-note" data-crew-id="${crew.crewId}">${cityssm.escapeHTML(crew.shiftCrewNote)}</span></td>`

      if (isEdit) {
        html += '<td class="has-text-right">'
        html += `<button class="button is-small is-light is-warning button--editCrewNote" data-crew-id="${crew.crewId}" type="button" title="Edit Note"><i class="fa-solid fa-edit"></i></button> `
        html += `<button class="button is-small is-light is-danger button--deleteCrew" data-crew-id="${crew.crewId}" type="button" title="Delete"><i class="fa-solid fa-trash"></i></button>`
        html += '</td>'
      }

      html += '</tr>'
    }

    html += '</tbody></table>'
    containerElement.innerHTML = html

    if (isEdit) {
      const editNoteButtons = containerElement.querySelectorAll(
        '.button--editCrewNote'
      )
      for (const button of editNoteButtons) {
        button.addEventListener('click', editCrewNote)
      }

      const deleteButtons = containerElement.querySelectorAll(
        '.button--deleteCrew'
      )
      for (const button of deleteButtons) {
        button.addEventListener('click', deleteShiftCrew)
      }
    }
  }

  function renderShiftEmployees(): void {
    const containerElement = document.querySelector(
      '#container--shiftEmployees'
    ) as HTMLElement

    if (shiftEmployees.length === 0) {
      containerElement.innerHTML = `<div class="message"><div class="message-body">No employees assigned to this shift.</div></div>`
      return
    }

    let html = '<table class="table is-fullwidth is-striped is-hoverable">'
    html += '<thead><tr><th>Employee</th><th>Crew</th><th>Note</th>'
    if (isEdit) {
      html += '<th class="has-text-right">Actions</th>'
    }
    html += '</tr></thead><tbody>'

    for (const employee of shiftEmployees) {
      html += '<tr>'
      html += `<td>${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}</td>`
      html += `<td>${cityssm.escapeHTML(employee.crewName ?? '')}</td>`
      html += `<td><span class="employee-note" data-employee-number="${employee.employeeNumber}">${cityssm.escapeHTML(employee.shiftEmployeeNote)}</span></td>`

      if (isEdit) {
        html += '<td class="has-text-right">'
        html += `<button class="button is-small is-light is-info button--editEmployeeCrew" data-employee-number="${employee.employeeNumber}" type="button" title="Change Crew"><i class="fa-solid fa-users-gear"></i></button> `
        html += `<button class="button is-small is-light is-warning button--editEmployeeNote" data-employee-number="${employee.employeeNumber}" type="button" title="Edit Note"><i class="fa-solid fa-edit"></i></button> `
        html += `<button class="button is-small is-light is-danger button--deleteEmployee" data-employee-number="${employee.employeeNumber}" type="button" title="Delete"><i class="fa-solid fa-trash"></i></button>`
        html += '</td>'
      }

      html += '</tr>'
    }

    html += '</tbody></table>'
    containerElement.innerHTML = html

    if (isEdit) {
      const editCrewButtons = containerElement.querySelectorAll(
        '.button--editEmployeeCrew'
      )
      for (const button of editCrewButtons) {
        button.addEventListener('click', editEmployeeCrew)
      }

      const editNoteButtons = containerElement.querySelectorAll(
        '.button--editEmployeeNote'
      )
      for (const button of editNoteButtons) {
        button.addEventListener('click', editEmployeeNote)
      }

      const deleteButtons = containerElement.querySelectorAll(
        '.button--deleteEmployee'
      )
      for (const button of deleteButtons) {
        button.addEventListener('click', deleteShiftEmployee)
      }
    }
  }

  function renderShiftEquipment(): void {
    const containerElement = document.querySelector(
      '#container--shiftEquipment'
    ) as HTMLElement

    if (shiftEquipment.length === 0) {
      containerElement.innerHTML = `<div class="message"><div class="message-body">No equipment assigned to this shift.</div></div>`
      return
    }

    let html = '<table class="table is-fullwidth is-striped is-hoverable">'
    html +=
      '<thead><tr><th>Equipment</th><th>Assigned Employee</th><th>Note</th>'
    if (isEdit) {
      html += '<th class="has-text-right">Actions</th>'
    }
    html += '</tr></thead><tbody>'

    for (const equipment of shiftEquipment) {
      html += '<tr>'
      html += `<td>${cityssm.escapeHTML(equipment.equipmentName ?? '')}</td>`
      html += `<td>${equipment.employeeLastName ? cityssm.escapeHTML(equipment.employeeLastName) + ', ' + cityssm.escapeHTML(equipment.employeeFirstName ?? '') : ''}</td>`
      html += `<td><span class="equipment-note" data-equipment-number="${equipment.equipmentNumber}">${cityssm.escapeHTML(equipment.shiftEquipmentNote)}</span></td>`

      if (isEdit) {
        html += '<td class="has-text-right">'
        html += `<button class="button is-small is-light is-info button--editEquipmentEmployee" data-equipment-number="${equipment.equipmentNumber}" type="button" title="Assign Employee"><i class="fa-solid fa-user"></i></button> `
        html += `<button class="button is-small is-light is-warning button--editEquipmentNote" data-equipment-number="${equipment.equipmentNumber}" type="button" title="Edit Note"><i class="fa-solid fa-edit"></i></button> `
        html += `<button class="button is-small is-light is-danger button--deleteEquipment" data-equipment-number="${equipment.equipmentNumber}" type="button" title="Delete"><i class="fa-solid fa-trash"></i></button>`
        html += '</td>'
      }

      html += '</tr>'
    }

    html += '</tbody></table>'
    containerElement.innerHTML = html

    if (isEdit) {
      const editEmployeeButtons = containerElement.querySelectorAll(
        '.button--editEquipmentEmployee'
      )
      for (const button of editEmployeeButtons) {
        button.addEventListener('click', editEquipmentEmployee)
      }

      const editNoteButtons = containerElement.querySelectorAll(
        '.button--editEquipmentNote'
      )
      for (const button of editNoteButtons) {
        button.addEventListener('click', editEquipmentNote)
      }

      const deleteButtons = containerElement.querySelectorAll(
        '.button--deleteEquipment'
      )
      for (const button of deleteButtons) {
        button.addEventListener('click', deleteShiftEquipment)
      }
    }
  }

  function refreshData(): void {
    cityssm.postJSON(
      `${urlPrefix}/doGetShiftCrews`,
      { shiftId },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          shiftCrews: ShiftCrew[]
        }
        shiftCrews = responseJSON.shiftCrews
        renderShiftCrews()
      }
    )

    cityssm.postJSON(
      `${urlPrefix}/doGetShiftEmployees`,
      { shiftId },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          shiftEmployees: ShiftEmployee[]
        }
        shiftEmployees = responseJSON.shiftEmployees
        renderShiftEmployees()
      }
    )

    cityssm.postJSON(
      `${urlPrefix}/doGetShiftEquipment`,
      { shiftId },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          shiftEquipment: ShiftEquipment[]
        }
        shiftEquipment = responseJSON.shiftEquipment
        renderShiftEquipment()
      }
    )
  }

  function loadAvailableData(): void {
    cityssm.postJSON(
      `${urlPrefix}/doGetAvailableCrewsEmployeesEquipment`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          crews: Crew[]
          employees: Employee[]
          equipment: Equipment[]
        }
        availableCrews = responseJSON.crews
        availableEmployees = responseJSON.employees
        availableEquipment = responseJSON.equipment
      }
    )
  }

  function addCrew(): void {
    let formHTML = '<form id="form--addCrew">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Crew</label>'
    formHTML += '<div class="control"><div class="select is-fullwidth">'
    formHTML += '<select name="crewId" required>'
    formHTML += '<option value="">(Select Crew)</option>'

    for (const crew of availableCrews) {
      // Skip crews already added
      if (shiftCrews.some((sc) => sc.crewId === crew.crewId)) {
        continue
      }
      formHTML += `<option value="${crew.crewId}">${cityssm.escapeHTML(crew.crewName)}</option>`
    }

    formHTML += '</select></div></div></div>'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Note</label>'
    formHTML +=
      '<div class="control"><textarea class="textarea" name="shiftCrewNote" maxlength="200"></textarea></div>'
    formHTML += '</div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Add Crew',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Add Crew',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--addCrew'
          ) as HTMLFormElement

          cityssm.postJSON(
            `${urlPrefix}/doAddShiftCrew`,
            {
              shiftId,
              crewId: (
                formElement.elements.namedItem('crewId') as HTMLSelectElement
              ).value,
              shiftCrewNote: (
                formElement.elements.namedItem(
                  'shiftCrewNote'
                ) as HTMLTextAreaElement
              ).value
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Crew added successfully'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to add crew'
                })
              }
            }
          )
        }
      }
    })
  }

  function addEmployee(): void {
    let formElement: HTMLFormElement

    function doAdd(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doAddShiftEmployee`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Employee added successfully'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error',
              message: 'Failed to add employee'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('shifts-addEmployee', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId

        const employeeNumberElement = modalElement.querySelector(
          'select[name="employeeNumber"]'
        ) as HTMLSelectElement

        for (const employee of availableEmployees) {
          // Skip employees already added
          if (
            shiftEmployees.some(
              (se) => se.employeeNumber === employee.employeeNumber
            )
          ) {
            continue
          }
          employeeNumberElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(employee.employeeNumber)}">
              ${cityssm.escapeHTML(employee.lastName)}, ${cityssm.escapeHTML(employee.firstName)}
              </option>`
          )
        }

        const crewIdElement = modalElement.querySelector(
          'select[name="crewId"]'
        ) as HTMLSelectElement

        for (const crew of shiftCrews) {
          crewIdElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(crew.crewId.toString())}">
              ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>`
          )
        }
      },
      onshown(modalElement) {
        bulmaJS.toggleHtmlClipped()

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doAdd)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function addEquipment(): void {
    let formHTML = '<form id="form--addEquipment">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Equipment</label>'
    formHTML += '<div class="control"><div class="select is-fullwidth">'
    formHTML += '<select name="equipmentNumber" required>'
    formHTML += '<option value="">(Select Equipment)</option>'

    for (const equipment of availableEquipment) {
      // Skip equipment already added
      if (
        shiftEquipment.some(
          (se) => se.equipmentNumber === equipment.equipmentNumber
        )
      ) {
        continue
      }
      formHTML += `<option value="${equipment.equipmentNumber}">${cityssm.escapeHTML(equipment.equipmentName)}</option>`
    }

    formHTML += '</select></div></div></div>'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Assigned Employee (Optional)</label>'
    formHTML += '<div class="control"><div class="select is-fullwidth">'
    formHTML += '<select name="employeeNumber">'
    formHTML += '<option value="">(None)</option>'

    for (const employee of shiftEmployees) {
      formHTML += `<option value="${employee.employeeNumber}">${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}</option>`
    }

    formHTML += '</select></div></div></div>'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Note</label>'
    formHTML +=
      '<div class="control"><textarea class="textarea" name="shiftEquipmentNote" maxlength="200"></textarea></div>'
    formHTML += '</div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Add Equipment',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Add Equipment',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--addEquipment'
          ) as HTMLFormElement

          const employeeNumberValue = (
            formElement.elements.namedItem(
              'employeeNumber'
            ) as HTMLSelectElement
          ).value

          cityssm.postJSON(
            `${urlPrefix}/doAddShiftEquipment`,
            {
              shiftId,
              equipmentNumber: (
                formElement.elements.namedItem(
                  'equipmentNumber'
                ) as HTMLSelectElement
              ).value,
              employeeNumber:
                employeeNumberValue === '' ? null : employeeNumberValue,
              shiftEquipmentNote: (
                formElement.elements.namedItem(
                  'shiftEquipmentNote'
                ) as HTMLTextAreaElement
              ).value
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Equipment added successfully'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to add equipment'
                })
              }
            }
          )
        }
      }
    })
  }

  function editCrewNote(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const crewId = buttonElement.dataset.crewId

    const crew = shiftCrews.find((c) => c.crewId.toString() === crewId)
    if (crew === undefined) {
      return
    }

    let formHTML = '<form id="form--editCrewNote">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Note</label>'
    formHTML += `<div class="control"><textarea class="textarea" name="shiftCrewNote" maxlength="200">${cityssm.escapeHTML(crew.shiftCrewNote)}</textarea></div>`
    formHTML += '</div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Edit Crew Note',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Update Note',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--editCrewNote'
          ) as HTMLFormElement

          cityssm.postJSON(
            `${urlPrefix}/doUpdateShiftCrewNote`,
            {
              shiftId,
              crewId,
              shiftCrewNote: (
                formElement.elements.namedItem(
                  'shiftCrewNote'
                ) as HTMLTextAreaElement
              ).value
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to update note'
                })
              }
            }
          )
        }
      }
    })
  }

  function editEmployeeCrew(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const employeeNumber = buttonElement.dataset.employeeNumber

    const employee = shiftEmployees.find(
      (e) => e.employeeNumber === employeeNumber
    )
    if (employee === undefined) {
      return
    }

    let formHTML = '<form id="form--editEmployeeCrew">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Crew</label>'
    formHTML += '<div class="control"><div class="select is-fullwidth">'
    formHTML += '<select name="crewId">'
    formHTML += '<option value="">(None)</option>'

    for (const crew of shiftCrews) {
      const selected = crew.crewId === employee.crewId ? ' selected' : ''
      formHTML += `<option value="${crew.crewId}"${selected}>${cityssm.escapeHTML(crew.crewName ?? '')}</option>`
    }

    formHTML += '</select></div></div></div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Change Employee Crew',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Update Crew',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--editEmployeeCrew'
          ) as HTMLFormElement

          const crewIdValue = (
            formElement.elements.namedItem('crewId') as HTMLSelectElement
          ).value

          cityssm.postJSON(
            `${urlPrefix}/doUpdateShiftEmployee`,
            {
              shiftId,
              employeeNumber,
              crewId: crewIdValue === '' ? null : crewIdValue
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to update crew'
                })
              }
            }
          )
        }
      }
    })
  }

  function editEmployeeNote(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const employeeNumber = buttonElement.dataset.employeeNumber

    const employee = shiftEmployees.find(
      (e) => e.employeeNumber === employeeNumber
    )
    if (employee === undefined) {
      return
    }

    let formHTML = '<form id="form--editEmployeeNote">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Note</label>'
    formHTML += `<div class="control"><textarea class="textarea" name="shiftEmployeeNote" maxlength="200">${cityssm.escapeHTML(employee.shiftEmployeeNote)}</textarea></div>`
    formHTML += '</div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Edit Employee Note',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Update Note',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--editEmployeeNote'
          ) as HTMLFormElement

          cityssm.postJSON(
            `${urlPrefix}/doUpdateShiftEmployeeNote`,
            {
              shiftId,
              employeeNumber,
              shiftEmployeeNote: (
                formElement.elements.namedItem(
                  'shiftEmployeeNote'
                ) as HTMLTextAreaElement
              ).value
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to update note'
                })
              }
            }
          )
        }
      }
    })
  }

  function editEquipmentEmployee(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const equipmentNumber = buttonElement.dataset.equipmentNumber

    const equipment = shiftEquipment.find(
      (e) => e.equipmentNumber === equipmentNumber
    )
    if (equipment === undefined) {
      return
    }

    let formHTML = '<form id="form--editEquipmentEmployee">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Assigned Employee</label>'
    formHTML += '<div class="control"><div class="select is-fullwidth">'
    formHTML += '<select name="employeeNumber">'
    formHTML += '<option value="">(None)</option>'

    for (const employee of shiftEmployees) {
      const selected =
        employee.employeeNumber === equipment.employeeNumber ? ' selected' : ''
      formHTML += `<option value="${employee.employeeNumber}"${selected}>${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}</option>`
    }

    formHTML += '</select></div></div></div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Assign Equipment Employee',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Update Assignment',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--editEquipmentEmployee'
          ) as HTMLFormElement

          const employeeNumberValue = (
            formElement.elements.namedItem(
              'employeeNumber'
            ) as HTMLSelectElement
          ).value

          cityssm.postJSON(
            `${urlPrefix}/doUpdateShiftEquipment`,
            {
              shiftId,
              equipmentNumber,
              employeeNumber:
                employeeNumberValue === '' ? null : employeeNumberValue
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to update assignment'
                })
              }
            }
          )
        }
      }
    })
  }

  function editEquipmentNote(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const equipmentNumber = buttonElement.dataset.equipmentNumber

    const equipment = shiftEquipment.find(
      (e) => e.equipmentNumber === equipmentNumber
    )
    if (equipment === undefined) {
      return
    }

    let formHTML = '<form id="form--editEquipmentNote">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Note</label>'
    formHTML += `<div class="control"><textarea class="textarea" name="shiftEquipmentNote" maxlength="200">${cityssm.escapeHTML(equipment.shiftEquipmentNote)}</textarea></div>`
    formHTML += '</div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Edit Equipment Note',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Update Note',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--editEquipmentNote'
          ) as HTMLFormElement

          cityssm.postJSON(
            `${urlPrefix}/doUpdateShiftEquipmentNote`,
            {
              shiftId,
              equipmentNumber,
              shiftEquipmentNote: (
                formElement.elements.namedItem(
                  'shiftEquipmentNote'
                ) as HTMLTextAreaElement
              ).value
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to update note'
                })
              }
            }
          )
        }
      }
    })
  }

  function deleteShiftCrew(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const crewId = buttonElement.dataset.crewId

    const crew = shiftCrews.find((c) => c.crewId.toString() === crewId)

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Crew',
      message: `Are you sure you want to remove crew "${cityssm.escapeHTML(crew?.crewName ?? '')}" from this shift?`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete',
        callbackFunction: () => {
          cityssm.postJSON(
            `${urlPrefix}/doDeleteShiftCrew`,
            {
              shiftId,
              crewId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Crew removed successfully'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to remove crew'
                })
              }
            }
          )
        }
      }
    })
  }

  function deleteShiftEmployee(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const employeeNumber = buttonElement.dataset.employeeNumber

    const employee = shiftEmployees.find(
      (e) => e.employeeNumber === employeeNumber
    )

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Employee',
      message: `Are you sure you want to remove employee "${cityssm.escapeHTML(employee?.lastName ?? '')}, ${cityssm.escapeHTML(employee?.firstName ?? '')}" from this shift?`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete',
        callbackFunction: () => {
          cityssm.postJSON(
            `${urlPrefix}/doDeleteShiftEmployee`,
            {
              shiftId,
              employeeNumber
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Employee removed successfully'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to remove employee'
                })
              }
            }
          )
        }
      }
    })
  }

  function deleteShiftEquipment(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const equipmentNumber = buttonElement.dataset.equipmentNumber

    const equipment = shiftEquipment.find(
      (e) => e.equipmentNumber === equipmentNumber
    )

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Equipment',
      message: `Are you sure you want to remove equipment "${cityssm.escapeHTML(equipment?.equipmentName ?? '')}" from this shift?`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete',
        callbackFunction: () => {
          cityssm.postJSON(
            `${urlPrefix}/doDeleteShiftEquipment`,
            {
              shiftId,
              equipmentNumber
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Equipment removed successfully'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to remove equipment'
                })
              }
            }
          )
        }
      }
    })
  }

  function importFromPreviousShift(): void {
    let formHTML = '<form id="form--import">'
    formHTML += '<div class="field">'
    formHTML += '<label class="label">Previous Shift ID</label>'
    formHTML +=
      '<div class="control"><input class="input" type="number" name="previousShiftId" required /></div>'
    formHTML += '</div>'
    formHTML += '<div class="field">'
    formHTML += '<div class="control">'
    formHTML +=
      '<label class="checkbox"><input type="checkbox" name="copyCrews" checked /> Import Crews</label>'
    formHTML += '</div>'
    formHTML += '<div class="control">'
    formHTML +=
      '<label class="checkbox"><input type="checkbox" name="copyEmployees" checked /> Import Employees</label>'
    formHTML += '</div>'
    formHTML += '<div class="control">'
    formHTML +=
      '<label class="checkbox"><input type="checkbox" name="copyEquipment" checked /> Import Equipment</label>'
    formHTML += '</div>'
    formHTML += '</div>'
    formHTML += '</form>'

    bulmaJS.confirm({
      title: 'Import from Previous Shift',
      message: formHTML,
      messageIsHtml: true,
      okButton: {
        text: 'Import',
        callbackFunction: () => {
          const formElement = document.querySelector(
            '#form--import'
          ) as HTMLFormElement

          cityssm.postJSON(
            `${urlPrefix}/doCopyFromPreviousShift`,
            {
              currentShiftId: shiftId,
              previousShiftId: (
                formElement.elements.namedItem(
                  'previousShiftId'
                ) as HTMLInputElement
              ).value,
              copyCrews: (
                formElement.elements.namedItem('copyCrews') as HTMLInputElement
              ).checked,
              copyEmployees: (
                formElement.elements.namedItem(
                  'copyEmployees'
                ) as HTMLInputElement
              ).checked,
              copyEquipment: (
                formElement.elements.namedItem(
                  'copyEquipment'
                ) as HTMLInputElement
              ).checked
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as { success: boolean }

              if (responseJSON.success) {
                refreshData()
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Imported successfully'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',
                  message: 'Failed to import from previous shift'
                })
              }
            }
          )
        }
      }
    })
  }

  // Event listeners for add buttons
  if (isEdit) {
    document
      .querySelector('#button--addCrew')
      ?.addEventListener('click', addCrew)
    document
      .querySelector('#button--addEmployee')
      ?.addEventListener('click', addEmployee)
    document
      .querySelector('#button--addEquipment')
      ?.addEventListener('click', addEquipment)
    document
      .querySelector('#button--importFromPreviousShift')
      ?.addEventListener('click', importFromPreviousShift)

    loadAvailableData()
  }

  // Initial data load
  refreshData()
})()
