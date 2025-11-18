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
    let formElement: HTMLFormElement

    function doAdd(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doAddShiftCrew`,
        formElement,
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

    cityssm.openHtmlModal('shifts-addCrew', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId

        const crewIdElement = modalElement.querySelector(
          'select[name="crewId"]'
        ) as HTMLSelectElement

        for (const crew of availableCrews) {
          // Skip crews already added
          if (shiftCrews.some((sc) => sc.crewId === crew.crewId)) {
            continue
          }
          crewIdElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${crew.crewId}">
              ${cityssm.escapeHTML(crew.crewName)}
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

  function addEmployee(): void {
    let formElement: HTMLFormElement
    let closeModalFunction: () => void

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
            closeModalFunction()
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
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doAdd)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function addEquipment(): void {
    let closeModalFunction: () => void
    let formElement: HTMLFormElement

    function doAdd(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doAddShiftEquipment`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Equipment added successfully'
            })
            closeModalFunction()
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

    cityssm.openHtmlModal('shifts-addEquipment', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId

        const equipmentNumberElement = modalElement.querySelector(
          'select[name="equipmentNumber"]'
        ) as HTMLSelectElement

        for (const equipment of availableEquipment) {
          // Skip equipment already added
          if (
            shiftEquipment.some(
              (se) => se.equipmentNumber === equipment.equipmentNumber
            )
          ) {
            continue
          }
          equipmentNumberElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(equipment.equipmentNumber)}">
              ${cityssm.escapeHTML(equipment.equipmentName)}
              </option>`
          )
        }

        const employeeNumberElement = modalElement.querySelector(
          'select[name="employeeNumber"]'
        ) as HTMLSelectElement

        for (const employee of shiftEmployees) {
          employeeNumberElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(employee.employeeNumber)}">
              ${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}
              </option>`
          )
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doAdd)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doUpdate(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doUpdateShiftCrewNote`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            closeModalFunction()
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

    cityssm.openHtmlModal('shifts-editCrewNote', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
        ;(
          modalElement.querySelector('input[name="crewId"]') as HTMLInputElement
        ).value = crewId ?? ''
        ;(
          modalElement.querySelector(
            'textarea[name="shiftCrewNote"]'
          ) as HTMLTextAreaElement
        ).value = crew.shiftCrewNote
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doUpdate)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doUpdate(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doUpdateShiftEmployee`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            closeModalFunction()
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

    cityssm.openHtmlModal('shifts-editEmployeeCrew', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
        ;(
          modalElement.querySelector(
            'input[name="employeeNumber"]'
          ) as HTMLInputElement
        ).value = employeeNumber ?? ''

        const crewIdElement = modalElement.querySelector(
          'select[name="crewId"]'
        ) as HTMLSelectElement

        for (const crew of shiftCrews) {
          const selected = crew.crewId === employee.crewId
          crewIdElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${crew.crewId}"${selected ? ' selected' : ''}>
              ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>`
          )
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doUpdate)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doUpdate(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doUpdateShiftEmployeeNote`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            closeModalFunction()
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

    cityssm.openHtmlModal('shifts-editEmployeeNote', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
        ;(
          modalElement.querySelector(
            'input[name="employeeNumber"]'
          ) as HTMLInputElement
        ).value = employeeNumber ?? ''
        ;(
          modalElement.querySelector(
            'textarea[name="shiftEmployeeNote"]'
          ) as HTMLTextAreaElement
        ).value = employee.shiftEmployeeNote
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doUpdate)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doUpdate(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doUpdateShiftEquipment`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            closeModalFunction()
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

    cityssm.openHtmlModal('shifts-editEquipmentEmployee', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
        ;(
          modalElement.querySelector(
            'input[name="equipmentNumber"]'
          ) as HTMLInputElement
        ).value = equipmentNumber ?? ''

        const employeeNumberElement = modalElement.querySelector(
          'select[name="employeeNumber"]'
        ) as HTMLSelectElement

        for (const employee of shiftEmployees) {
          const selected = employee.employeeNumber === equipment.employeeNumber
          employeeNumberElement.insertAdjacentHTML(
            'beforeend',
            `<option value="${cityssm.escapeHTML(employee.employeeNumber)}"${selected ? ' selected' : ''}>
              ${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}
              </option>`
          )
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doUpdate)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
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

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doUpdate(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doUpdateShiftEquipmentNote`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            closeModalFunction()
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

    cityssm.openHtmlModal('shifts-editEquipmentNote', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="shiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
        ;(
          modalElement.querySelector(
            'input[name="equipmentNumber"]'
          ) as HTMLInputElement
        ).value = equipmentNumber ?? ''
        ;(
          modalElement.querySelector(
            'textarea[name="shiftEquipmentNote"]'
          ) as HTMLTextAreaElement
        ).value = equipment.shiftEquipmentNote
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doUpdate)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
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
    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doImport(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doCopyFromPreviousShift`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (responseJSON.success) {
            refreshData()
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Imported successfully'
            })
            closeModalFunction()
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

    cityssm.openHtmlModal('shifts-importFromPreviousShift', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            'input[name="currentShiftId"]'
          ) as HTMLInputElement
        ).value = shiftId
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector('form') as HTMLFormElement
        formElement.addEventListener('submit', doImport)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
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
