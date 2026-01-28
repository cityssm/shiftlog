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

import type { DoGetShiftCrewsResponse } from '../../handlers/shifts-post/doGetShiftCrews.js'
import type { DoGetShiftEmployeesResponse } from '../../handlers/shifts-post/doGetShiftEmployees.js'
import type { DoGetShiftEquipmentResponse } from '../../handlers/shifts-post/doGetShiftEquipment.js'
import type { DoGetAvailableCrewsEmployeesEquipmentResponse } from '../../handlers/shifts-post/doGetAvailableCrewsEmployeesEquipment.js'
import type { DoAddShiftCrewResponse } from '../../handlers/shifts-post/doAddShiftCrew.js'
import type { DoAddShiftEmployeeResponse } from '../../handlers/shifts-post/doAddShiftEmployee.js'
import type { DoAddShiftEquipmentResponse } from '../../handlers/shifts-post/doAddShiftEquipment.js'
import type { DoUpdateShiftCrewNoteResponse } from '../../handlers/shifts-post/doUpdateShiftCrewNote.js'
import type { DoUpdateShiftEmployeeResponse } from '../../handlers/shifts-post/doUpdateShiftEmployee.js'
import type { DoUpdateShiftEmployeeNoteResponse } from '../../handlers/shifts-post/doUpdateShiftEmployeeNote.js'
import type { DoUpdateShiftEquipmentResponse } from '../../handlers/shifts-post/doUpdateShiftEquipment.js'
import type { DoUpdateShiftEquipmentNoteResponse } from '../../handlers/shifts-post/doUpdateShiftEquipmentNote.js'
import type { DoDeleteShiftCrewResponse } from '../../handlers/shifts-post/doDeleteShiftCrew.js'
import type { DoDeleteShiftEmployeeResponse } from '../../handlers/shifts-post/doDeleteShiftEmployee.js'
import type { DoDeleteShiftEquipmentResponse } from '../../handlers/shifts-post/doDeleteShiftEquipment.js'
import type { DoCopyFromPreviousShiftResponse } from '../../handlers/shifts-post/doCopyFromPreviousShift.js'
import type { DoGetPreviousShiftsResponse } from '../../handlers/shifts-post/doGetPreviousShifts.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal

  shiftCrews: ShiftCrew[]
  shiftEmployees: ShiftEmployee[]
  shiftEquipment: ShiftEquipment[]
}
;(() => {
  const shiftLog = exports.shiftLog
  const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`

  const shiftIdElement = document.querySelector(
    '#shift--shiftId'
  ) as HTMLInputElement
  const shiftId = shiftIdElement.value

  const isEdit = document.querySelector('#button--addCrew') !== null

  let shiftCrews = exports.shiftCrews
  let shiftEmployees = exports.shiftEmployees
  let shiftEquipment = exports.shiftEquipment

  let availableCrews: Crew[] = []
  let availableEmployees: Employee[] = []
  let availableEquipment: Equipment[] = []

  /**
   * Switch to a specific tab
   * @param tabId - The ID of the tab content to show (e.g., 'tab-content--crews')
   */
  function switchToTab(tabId: string): void {
    // Find the tab link for this content
    const tabLink = document.querySelector(
      `a[href="#${tabId}"]`
    ) as HTMLAnchorElement | null

    if (tabLink !== null) {
      // Remove is-active from all tabs
      const allTabLinks = document.querySelectorAll(
        '#tab--employees .tabs a'
      ) as NodeListOf<HTMLAnchorElement>

      for (const link of allTabLinks) {
        link.parentElement?.classList.remove('is-active')
      }

      // Set is-active on the selected tab
      tabLink.parentElement?.classList.add('is-active')

      // Hide all tab content
      const allTabContent = document.querySelectorAll(
        '[id^="tab-content--crews"], [id^="tab-content--employees"], [id^="tab-content--equipment"]'
      ) as NodeListOf<HTMLElement>

      for (const content of allTabContent) {
        content.classList.add('is-hidden')
      }

      // Show the selected tab content
      const selectedContent = document.querySelector(
        `#${tabId}`
      ) as HTMLElement | null
      if (selectedContent !== null) {
        selectedContent.classList.remove('is-hidden')
      }
    }
  }

  function updateCounts(): void {
    // Update count badges
    const crewsCountElement = document.querySelector('#crewsCount')
    if (crewsCountElement !== null) {
      crewsCountElement.textContent = shiftCrews.length.toString()
    }

    const employeesCountElement = document.querySelector('#employeesCount')
    if (employeesCountElement !== null) {
      employeesCountElement.textContent = shiftEmployees.length.toString()
    }

    const equipmentCountElement = document.querySelector('#equipmentCount')
    if (equipmentCountElement !== null) {
      equipmentCountElement.textContent = shiftEquipment.length.toString()
    }

    // Show/hide checkmark icon on main tab
    const hasEmployeesEquipmentIcon = document.querySelector(
      '#icon--hasEmployeesEquipment'
    )
    if (hasEmployeesEquipmentIcon !== null) {
      hasEmployeesEquipmentIcon.classList.toggle(
        'is-hidden',
        !(
          shiftCrews.length > 0 ||
          shiftEmployees.length > 0 ||
          shiftEquipment.length > 0
        )
      )
    }
  }

  function renderShiftCrews(): void {
    const containerElement = document.querySelector(
      '#container--shiftCrews'
    ) as HTMLElement

    if (shiftCrews.length === 0) {
      containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No crews assigned to this shift.</div>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    // eslint-disable-next-line no-unsanitized/property
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Crew</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tbodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const crew of shiftCrews) {
      const rowElement = document.createElement('tr')

      rowElement.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(crew.crewName ?? '')}</td>
        <td>
          <span class="crew-note" data-crew-id="${cityssm.escapeHTML(crew.crewId.toString())}">
            ${cityssm.escapeHTML(crew.shiftCrewNote)}
          </span>
        </td>
      `

      if (isEdit) {
        rowElement.insertAdjacentHTML(
          'beforeend',
          /* html */ `
            <td class="has-text-right">
              <button
                class="button is-small is-light is-warning button--editCrewNote"
                data-crew-id="${cityssm.escapeHTML(crew.crewId.toString())}"
                type="button"
                title="Edit Note"
              >
                <i class="fa-solid fa-edit"></i>
              </button>
              <button
                class="button is-small is-light is-danger button--deleteCrew"
                data-crew-id="${cityssm.escapeHTML(crew.crewId.toString())}"
                type="button"
                title="Delete"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `
        )
      }

      tbodyElement.append(rowElement)
    }

    containerElement.replaceChildren(tableElement)

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
      containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No employees assigned to this shift.</div>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    // eslint-disable-next-line no-unsanitized/property
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Employee</th>
          <th>Crew</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tableBodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const employee of shiftEmployees) {
      const rowElement = document.createElement('tr')

      rowElement.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}</td>
        <td>${cityssm.escapeHTML(employee.crewName ?? '')}</td>
        <td>
          <span class="employee-note" data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}">
            ${cityssm.escapeHTML(employee.shiftEmployeeNote)}
          </span>
        </td>
      `

      if (isEdit) {
        rowElement.insertAdjacentHTML(
          'beforeend',
          /* html */ `
            <td class="has-text-right">
              <button
                class="button is-small is-light is-info button--editEmployeeCrew"
                data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
                type="button"
                title="Change Crew"
              >
                <i class="fa-solid fa-users-gear"></i>
              </button> 
              <button
                class="button is-small is-light is-warning button--editEmployeeNote"
                data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
                type="button"
                title="Edit Note"
              >
                <i class="fa-solid fa-edit"></i>
              </button> 
              <button
                class="button is-small is-light is-danger button--deleteEmployee"
                data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
                type="button"
                title="Delete"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `
        )
      }

      tableBodyElement.append(rowElement)
    }

    containerElement.replaceChildren(tableElement)

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
      containerElement.innerHTML = /* html */ `
        <div class="message">
          <div class="message-body">No equipment assigned to this shift.</div>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    // eslint-disable-next-line no-unsanitized/property
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Equipment</th>
          <th>Assigned Employee</th>
          <th>Note</th>
          ${isEdit ? '<th class="has-text-right">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tableBodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const equipment of shiftEquipment) {
      const rowElement = document.createElement('tr')

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = /* html */ `
        <td>${cityssm.escapeHTML(equipment.equipmentName ?? '')}</td>
        <td>
          ${(equipment.employeeLastName ?? '') === '' ? '' : cityssm.escapeHTML(`${equipment.employeeLastName ?? ''}, ${equipment.employeeFirstName ?? ''}`)}
        </td>
        <td>
          <span class="equipment-note" data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}">
            ${cityssm.escapeHTML(equipment.shiftEquipmentNote)}
          </span>
        </td>
      `

      if (isEdit) {
        rowElement.insertAdjacentHTML(
          'beforeend',
          /* html */ `
            <td class="has-text-right">
              <button
                class="button is-small is-light is-info button--editEquipmentEmployee"
                data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}"
                type="button"
                title="Assign Employee"
              >
                <i class="fa-solid fa-user"></i>
              </button>
              <button
                class="button is-small is-light is-warning button--editEquipmentNote"
                data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}"
                type="button"
                title="Edit Note"
              >
                <i class="fa-solid fa-edit"></i>
              </button>
              <button
                class="button is-small is-light is-danger button--deleteEquipment"
                data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}"
                type="button"
                title="Delete"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `
        )
      }

      tableBodyElement.append(rowElement)
    }

    containerElement.replaceChildren(tableElement)

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

  function refreshCrewData(): void {
    cityssm.postJSON(
      `${urlPrefix}/doGetShiftCrews`,
      { shiftId },
      (responseJSON: DoGetShiftCrewsResponse) => {
        shiftCrews = responseJSON.shiftCrews
        renderShiftCrews()
        updateCounts()
      }
    )
  }

  function refreshEmployeeData(): void {
    cityssm.postJSON(
      `${urlPrefix}/doGetShiftEmployees`,
      { shiftId },
      (responseJSON: DoGetShiftEmployeesResponse) => {
        shiftEmployees = responseJSON.shiftEmployees
        renderShiftEmployees()
        updateCounts()
      }
    )
  }

  function refreshEquipmentData(): void {
    cityssm.postJSON(
      `${urlPrefix}/doGetShiftEquipment`,
      { shiftId },
      (responseJSON: DoGetShiftEquipmentResponse) => {
        shiftEquipment = responseJSON.shiftEquipment
        renderShiftEquipment()
        updateCounts()
      }
    )
  }

  function refreshData(): void {
    refreshCrewData()
    refreshEmployeeData()
    refreshEquipmentData()
  }

  function loadAvailableData(): void {
    cityssm.postJSON(
      // eslint-disable-next-line no-secrets/no-secrets
      `${urlPrefix}/doGetAvailableCrewsEmployeesEquipment`,
      {},
      (responseJSON: DoGetAvailableCrewsEmployeesEquipmentResponse) => {
        availableCrews = responseJSON.crews
        availableEmployees = responseJSON.employees
        availableEquipment = responseJSON.equipment
      }
    )
  }

  function addCrew(clickEvent: Event): void {
    clickEvent.preventDefault()

    let formElement: HTMLFormElement

    function doAdd(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doAddShiftCrew`,
        formElement,
        (responseJSON: DoAddShiftCrewResponse) => {
          if (responseJSON.success) {
            refreshData()
            switchToTab('tab-content--crews')
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
            /* html */ `
              <option value="${cityssm.escapeHTML(crew.crewId.toString())}">
                ${cityssm.escapeHTML(crew.crewName)}
              </option>
            `
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

  function addEmployee(clickEvent: Event): void {
    clickEvent.preventDefault()

    let formElement: HTMLFormElement
    let closeModalFunction: () => void

    function doAdd(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doAddShiftEmployee`,
        formElement,
        (responseJSON: DoAddShiftEmployeeResponse) => {
          if (responseJSON.success) {
            refreshData()
            switchToTab('tab-content--employees')
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
            /* html */ `
              <option value="${cityssm.escapeHTML(employee.employeeNumber)}">
                ${cityssm.escapeHTML(employee.lastName)},
                ${cityssm.escapeHTML(employee.firstName)}
                (${cityssm.escapeHTML(employee.employeeNumber)})
              </option>
            `
          )
        }

        const crewIdElement = modalElement.querySelector(
          'select[name="crewId"]'
        ) as HTMLSelectElement

        for (const crew of shiftCrews) {
          crewIdElement.insertAdjacentHTML(
            'beforeend',
            /* html */ `
              <option value="${cityssm.escapeHTML(crew.crewId.toString())}">
                ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>
            `
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

  function addEquipment(clickEvent: Event): void {
    clickEvent.preventDefault()

    let closeModalFunction: () => void
    let formElement: HTMLFormElement

    function doAdd(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doAddShiftEquipment`,
        formElement,
        (responseJSON: DoAddShiftEquipmentResponse) => {
          if (responseJSON.success) {
            refreshData()
            switchToTab('tab-content--equipment')
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Equipment added successfully'
            })
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error',

              message: responseJSON.message ?? 'Failed to add equipment'
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
            /* html */ `
              <option value="${cityssm.escapeHTML(equipment.equipmentNumber)}">
                ${cityssm.escapeHTML(equipment.equipmentNumber)}
                -
                ${cityssm.escapeHTML(equipment.equipmentName)}
              </option>
            `
          )
        }

        const employeeNumberElement = modalElement.querySelector(
          'select[name="employeeNumber"]'
        ) as HTMLSelectElement

        for (const employee of shiftEmployees) {
          employeeNumberElement.insertAdjacentHTML(
            'beforeend',
            /* html */ `
              <option value="${cityssm.escapeHTML(employee.employeeNumber)}">
                ${cityssm.escapeHTML(employee.lastName ?? '')},
                ${cityssm.escapeHTML(employee.firstName ?? '')}
                (${cityssm.escapeHTML(employee.employeeNumber)})
              </option>
            `
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
        (responseJSON: DoUpdateShiftCrewNoteResponse) => {
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
      (possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber
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
        (responseJSON: DoUpdateShiftEmployeeResponse) => {
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
          // eslint-disable-next-line no-unsanitized/method
          crewIdElement.insertAdjacentHTML(
            'beforeend',
            /* html */ `
              <option
                value="${cityssm.escapeHTML(crew.crewId.toString())}"
                ${selected ? ' selected' : ''}
              >
                ${cityssm.escapeHTML(crew.crewName ?? '')}
              </option>
            `
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
      (possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber
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
        (responseJSON: DoUpdateShiftEmployeeNoteResponse) => {
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
      (possibleEquipment) =>
        possibleEquipment.equipmentNumber === equipmentNumber
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
        (responseJSON: DoUpdateShiftEquipmentResponse) => {
          if (responseJSON.success) {
            refreshData()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error',

              message: responseJSON.message ?? 'Failed to update assignment'
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

          // eslint-disable-next-line no-unsanitized/method
          employeeNumberElement.insertAdjacentHTML(
            'beforeend',
            /* html */ `
              <option
                value="${cityssm.escapeHTML(employee.employeeNumber)}"
                ${selected ? ' selected' : ''}
              >
                ${cityssm.escapeHTML(employee.lastName ?? '')}, ${cityssm.escapeHTML(employee.firstName ?? '')}
              </option>
            `
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
      (possibleEquipment) =>
        possibleEquipment.equipmentNumber === equipmentNumber
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
        (responseJSON: DoUpdateShiftEquipmentNoteResponse) => {
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
            (responseJSON: DoDeleteShiftCrewResponse) => {
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
      (possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber
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
            (responseJSON: DoDeleteShiftEmployeeResponse) => {
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
      (possibleEquipment) =>
        possibleEquipment.equipmentNumber === equipmentNumber
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
            (responseJSON: DoDeleteShiftEquipmentResponse) => {
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

  function importFromPreviousShift(clickEvent: Event): void {
    clickEvent.preventDefault()

    let formElement: HTMLFormElement
    let searchFormElement: HTMLFormElement
    let closeModalFunction: () => void

    function doImport(formEvent: Event): void {
      formEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doCopyFromPreviousShift`,
        formElement,
        (responseJSON: DoCopyFromPreviousShiftResponse) => {
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

    function doSearch(searchEvent: Event): void {
      searchEvent.preventDefault()

      cityssm.postJSON(
        `${urlPrefix}/doGetPreviousShifts`,
        searchFormElement,
        (responseJSON: DoGetPreviousShiftsResponse) => {
          const resultsContainer = document.querySelector(
            '#container--searchResults'
          ) as HTMLElement

          const listContainer = document.querySelector(
            '#list--shifts'
          ) as HTMLElement

          if (responseJSON.shifts.length === 0) {
            listContainer.innerHTML = /* html */ `
              <div class="message">
                <div class="message-body">No matching shifts found.</div>
              </div>
            `
          } else {
            listContainer.innerHTML = ''

            for (const shift of responseJSON.shifts) {
              const shiftDate = new Date(shift.shiftDate)
              const dateString = shiftDate.toLocaleDateString()

              const counts: string[] = []

              if ((shift.crewsCount ?? 0) > 0) {
                counts.push(
                  `${shift.crewsCount} crew${shift.crewsCount === 1 ? '' : 's'}`
                )
              }

              if ((shift.employeesCount ?? 0) > 0) {
                counts.push(
                  `${shift.employeesCount} employee${shift.employeesCount === 1 ? '' : 's'}`
                )
              }

              if ((shift.equipmentCount ?? 0) > 0) {
                counts.push(`${shift.equipmentCount} equipment`)
              }

              const countsText =
                counts.length > 0 ? ` (${counts.join(', ')})` : ''

              const shiftElement = document.createElement('a')

              shiftElement.className = 'panel-block is-block'
              shiftElement.dataset.shiftId = shift.shiftId.toString()
              shiftElement.href = '#'

              // All user data is escaped with cityssm.escapeHTML()
              // eslint-disable-next-line no-unsanitized/property
              shiftElement.innerHTML = /* html */ `
                <div class="columns is-mobile is-vcentered">
                  <div class="column">
                    <strong>Shift #${cityssm.escapeHTML(shift.shiftId.toString())}</strong>
                    - ${cityssm.escapeHTML(dateString)}
                    <br />
                    <small>
                      ${cityssm.escapeHTML(shift.shiftTypeDataListItem ?? '')}
                      ${(shift.shiftTimeDataListItem ?? '') === '' ? '' : ` - ${cityssm.escapeHTML(shift.shiftTimeDataListItem ?? '')}`}
                      ${(shift.supervisorLastName ?? '') === '' ? '' : ` - ${cityssm.escapeHTML(shift.supervisorLastName + ', ' + (shift.supervisorFirstName ?? ''))}`}
                    </small>
                    ${countsText === '' ? '' : '<br /><small class="has-text-grey">' + cityssm.escapeHTML(countsText) + '</small>'}
                  </div>
                  <div class="column is-narrow">
                    <span class="icon has-text-info">
                      <i class="fa-solid fa-chevron-right"></i>
                    </span>
                  </div>
                </div>
              `

              shiftElement.addEventListener('click', (clickEvent) => {
                clickEvent.preventDefault()
                const previousShiftIdInput = document.querySelector(
                  '#input--previousShiftId'
                ) as HTMLInputElement
                previousShiftIdInput.value = shift.shiftId.toString()

                // Highlight selected shift
                const allPanelBlocks =
                  listContainer.querySelectorAll('.panel-block')
                for (const block of allPanelBlocks) {
                  block.classList.remove('is-active')
                }
                shiftElement.classList.add('is-active')
              })

              listContainer.append(shiftElement)
            }
          }

          resultsContainer.classList.remove('is-hidden')
        }
      )
    }

    cityssm.openHtmlModal('shifts-importFromPreviousShift', {
      onshow(modalElement) {
        // Get current shift data from the form
        const currentShiftTypeId = (
          document.querySelector(
            '#shift--shiftTypeDataListItemId'
          ) as HTMLSelectElement
        ).value
        const currentSupervisorNumber = (
          document.querySelector(
            '#shift--supervisorEmployeeNumber'
          ) as HTMLSelectElement
        ).value
        const currentShiftTimeId = (
          document.querySelector(
            '#shift--shiftTimeDataListItemId'
          ) as HTMLSelectElement
        ).value
        const currentShiftDate = (
          document.querySelector('#shift--shiftDateString') as HTMLInputElement
        ).value

        // Set hidden fields
        const searchCurrentShiftIdInputs = modalElement.querySelectorAll(
          'input[name="currentShiftId"]'
        ) as NodeListOf<HTMLInputElement>
        for (const input of searchCurrentShiftIdInputs) {
          input.value = shiftId
        }

        // Set shift date for filtering
        ;(
          modalElement.querySelector(
            'form#form--searchShifts input[name="shiftDateString"]'
          ) as HTMLInputElement
        ).value = currentShiftDate

        // Populate shift types

        const shiftTypeSelect = modalElement.querySelector(
          '#search--shiftTypeDataListItemId'
        ) as HTMLSelectElement

        const shiftTypeOptions = document.querySelectorAll(
          '#shift--shiftTypeDataListItemId option'
        ) as NodeListOf<HTMLOptionElement>

        for (const option of shiftTypeOptions) {
          if (option.value !== '') {
            const newOption = option.cloneNode(true) as HTMLOptionElement
            newOption.selected = option.value === currentShiftTypeId
            shiftTypeSelect.append(newOption)
          }
        }

        shiftTypeSelect.addEventListener('change', doSearch)

        // Populate supervisors

        const supervisorSelect = modalElement.querySelector(
          '#search--supervisorEmployeeNumber'
        ) as HTMLSelectElement

        const supervisorOptions = document.querySelectorAll(
          '#shift--supervisorEmployeeNumber option'
        ) as NodeListOf<HTMLOptionElement>

        for (const option of supervisorOptions) {
          if (option.value !== '') {
            const newOption = option.cloneNode(true) as HTMLOptionElement
            newOption.selected = option.value === currentSupervisorNumber
            supervisorSelect.append(newOption)
          }
        }

        supervisorSelect.addEventListener('change', doSearch)

        // Populate shift times

        const shiftTimeSelect = modalElement.querySelector(
          '#search--shiftTimeDataListItemId'
        ) as HTMLSelectElement

        const shiftTimeOptions = document.querySelectorAll(
          '#shift--shiftTimeDataListItemId option'
        ) as NodeListOf<HTMLOptionElement>

        for (const option of shiftTimeOptions) {
          if (option.value !== '') {
            const newOption = option.cloneNode(true) as HTMLOptionElement
            newOption.selected = option.value === currentShiftTimeId
            shiftTimeSelect.append(newOption)
          }
        }

        shiftTimeSelect.addEventListener('change', doSearch)
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        formElement = modalElement.querySelector(
          '#form--import'
        ) as HTMLFormElement
        formElement.addEventListener('submit', doImport)

        searchFormElement = modalElement.querySelector(
          '#form--searchShifts'
        ) as HTMLFormElement
        searchFormElement.addEventListener('submit', doSearch)

        // Auto-trigger search with current shift's values
        doSearch(new Event('submit'))
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

  // Initial render
  renderShiftCrews()
  renderShiftEmployees()
  renderShiftEquipment()
  updateCounts()
})()
