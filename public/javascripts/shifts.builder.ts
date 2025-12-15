import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { DoGetShiftsForBuilderResponse } from '../../handlers/shifts-post/doGetShiftsForBuilder.js'
import type { ShiftForBuilder } from '../../database/shifts/getShiftsForBuilder.js'
import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: ShiftLogGlobal & {
    canManage: boolean
    canUpdate: boolean
    currentUser: string
  }
}

const minEditableDate = 0

;(() => {
  const shiftLog = exports.shiftLog

  const shiftDateElement = document.querySelector(
    '#builder--shiftDate'
  ) as HTMLInputElement

  const viewModeElement = document.querySelector(
    '#builder--viewMode'
  ) as HTMLSelectElement

  const resultsContainerElement = document.querySelector(
    '#container--shiftBuilderResults'
  ) as HTMLDivElement

  let currentShifts: ShiftForBuilder[] = []

  // Track items appearing on multiple shifts
  interface DuplicateTracker {
    [key: string]: number[] // key -> array of shiftIds
  }

  function getItemKey(
    type: 'employee' | 'equipment' | 'crew' | 'workOrder',
    id: string | number
  ): string {
    return `${type}:${id}`
  }

  function findDuplicates(shifts: ShiftForBuilder[]): DuplicateTracker {
    const tracker: DuplicateTracker = {}

    for (const shift of shifts) {
      // Track employees
      for (const employee of shift.employees) {
        const key = getItemKey('employee', employee.employeeNumber)
        if (tracker[key] === undefined) {
          tracker[key] = []
        }
        tracker[key].push(shift.shiftId)
      }

      // Track equipment
      for (const equipment of shift.equipment) {
        const key = getItemKey('equipment', equipment.equipmentNumber)
        if (tracker[key] === undefined) {
          tracker[key] = []
        }
        tracker[key].push(shift.shiftId)
      }

      // Track crews
      for (const crew of shift.crews) {
        const key = getItemKey('crew', crew.crewId)
        if (tracker[key] === undefined) {
          tracker[key] = []
        }
        tracker[key].push(shift.shiftId)
      }

      // Track work orders
      for (const workOrder of shift.workOrders) {
        const key = getItemKey('workOrder', workOrder.workOrderId)
        if (tracker[key] === undefined) {
          tracker[key] = []
        }
        tracker[key].push(shift.shiftId)
      }
    }

    // Remove items that only appear once
    for (const key in tracker) {
      if (tracker[key].length <= 1) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete tracker[key]
      }
    }

    return tracker
  }

  function isDuplicate(
    duplicates: DuplicateTracker,
    type: 'employee' | 'equipment' | 'crew' | 'workOrder',
    id: string | number
  ): boolean {
    const key = getItemKey(type, id)
    return duplicates[key] !== undefined
  }

  function isShiftEditable(shift: ShiftForBuilder): boolean {
    if (!shiftLog.canUpdate) {
      return false
    }

    const shiftDate = new Date(shift.shiftDate as string)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return shiftDate >= today
  }

  function wasUpdatedByOther(shift: ShiftForBuilder): boolean {
    return (
      shift.recordUpdate_userName !== undefined &&
      shift.recordUpdate_userName !== shiftLog.currentUser &&
      shift.recordUpdate_userName !== shift.recordCreate_userName
    )
  }

  function renderEmployeesView(
    shift: ShiftForBuilder,
    duplicates: DuplicateTracker
  ): string {
    const isEditable = isShiftEditable(shift)
    let html = '<div class="shift-details">'

    // Crews
    if (shift.crews.length > 0) {
      html += '<div class="mb-3"><strong>Crews:</strong><ul class="ml-4">'
      for (const crew of shift.crews) {
        const isDup = isDuplicate(duplicates, 'crew', crew.crewId)
        const dupClass = isDup ? ' has-background-warning-light' : ''
        html += `<li class="${dupClass}" data-crew-id="${crew.crewId}" draggable="${isEditable}">`
        html += cityssm.escapeHTML(crew.crewName)
        if (crew.shiftCrewNote !== '') {
          html += ` <span class="has-text-grey-light">- ${cityssm.escapeHTML(crew.shiftCrewNote)}</span>`
        }
        html += '</li>'
      }
      html += '</ul></div>'
    }

    // Employees
    if (shift.employees.length > 0) {
      html += '<div class="mb-3"><strong>Employees:</strong><ul class="ml-4">'
      for (const employee of shift.employees) {
        const isDup = isDuplicate(duplicates, 'employee', employee.employeeNumber)
        const dupClass = isDup ? ' has-background-warning-light' : ''
        html += `<li class="${dupClass}" data-employee-number="${employee.employeeNumber}" draggable="${isEditable}">`
        html += `${cityssm.escapeHTML(employee.lastName)}, ${cityssm.escapeHTML(employee.firstName)}`
        if (employee.crewName !== null) {
          html += ` <span class="tag is-small is-info is-light">${cityssm.escapeHTML(employee.crewName)}</span>`
        }
        if (employee.shiftEmployeeNote !== '') {
          html += ` <span class="has-text-grey-light">- ${cityssm.escapeHTML(employee.shiftEmployeeNote)}</span>`
        }
        html += '</li>'
      }
      html += '</ul></div>'
    }

    // Equipment
    if (shift.equipment.length > 0) {
      html += '<div class="mb-3"><strong>Equipment:</strong><ul class="ml-4">'
      for (const equipment of shift.equipment) {
        const isDup = isDuplicate(duplicates, 'equipment', equipment.equipmentNumber)
        const dupClass = isDup ? ' has-background-warning-light' : ''
        html += `<li class="${dupClass}" data-equipment-number="${equipment.equipmentNumber}" draggable="${isEditable}">`
        html += cityssm.escapeHTML(equipment.equipmentName)
        if (equipment.employeeFirstName !== null) {
          html += ` <span class="has-text-grey-light">(${cityssm.escapeHTML(equipment.employeeLastName ?? '')}, ${cityssm.escapeHTML(equipment.employeeFirstName)})</span>`
        }
        if (equipment.shiftEquipmentNote !== '') {
          html += ` <span class="has-text-grey-light">- ${cityssm.escapeHTML(equipment.shiftEquipmentNote)}</span>`
        }
        html += '</li>'
      }
      html += '</ul></div>'
    }

    if (shift.crews.length === 0 && shift.employees.length === 0 && shift.equipment.length === 0) {
      html += '<p class="has-text-grey-light">No employees or equipment assigned</p>'
    }

    html += '</div>'
    return html
  }

  function renderTasksView(
    shift: ShiftForBuilder,
    duplicates: DuplicateTracker
  ): string {
    const isEditable = isShiftEditable(shift)
    let html = '<div class="shift-details">'

    if (shift.workOrders.length > 0) {
      html += '<div class="mb-3"><strong>Work Orders:</strong><ul class="ml-4">'
      for (const workOrder of shift.workOrders) {
        const isDup = isDuplicate(duplicates, 'workOrder', workOrder.workOrderId)
        const dupClass = isDup ? ' has-background-warning-light' : ''
        html += `<li class="${dupClass}" data-workorder-id="${workOrder.workOrderId}" draggable="${isEditable}">`
        html += `<a href="${shiftLog.urlPrefix}/workOrders/${workOrder.workOrderId}" target="_blank">`
        html += cityssm.escapeHTML(workOrder.workOrderNumber)
        html += '</a>'
        if (workOrder.workOrderDescription !== '') {
          html += ` - ${cityssm.escapeHTML(workOrder.workOrderDescription)}`
        }
        if (workOrder.shiftWorkOrderNote !== '') {
          html += ` <span class="has-text-grey-light">- ${cityssm.escapeHTML(workOrder.shiftWorkOrderNote)}</span>`
        }
        html += '</li>'
      }
      html += '</ul></div>'
    } else {
      html += '<p class="has-text-grey-light">No work orders assigned</p>'
    }

    html += '</div>'
    return html
  }

  function renderShiftCard(
    shift: ShiftForBuilder,
    duplicates: DuplicateTracker,
    viewMode: string
  ): HTMLElement {
    const cardElement = document.createElement('div')
    cardElement.className = 'column is-half-tablet is-one-third-desktop'
    cardElement.dataset.shiftId = shift.shiftId.toString()

    const updatedByOther = wasUpdatedByOther(shift)
    const warningClass = updatedByOther ? ' has-background-warning-light' : ''
    const isEditable = isShiftEditable(shift)

    let cardHTML = `<div class="box${warningClass}">`

    // Header
    cardHTML += '<div class="level is-mobile mb-3">'
    cardHTML += '<div class="level-left">'
    cardHTML += '<div class="level-item">'
    cardHTML += `<h3 class="title is-5 mb-0">`
    cardHTML += `<a href="${shiftLog.urlPrefix}/shifts/${shift.shiftId}">`
    cardHTML += cityssm.escapeHTML(shift.shiftTypeDataListItem ?? 'Shift')
    cardHTML += `</a></h3>`
    cardHTML += '</div></div>'
    cardHTML += '<div class="level-right">'
    if (updatedByOther) {
      cardHTML += '<div class="level-item">'
      cardHTML += '<span class="icon has-text-warning" title="Modified by another user">'
      cardHTML += '<i class="fa-solid fa-exclamation-triangle"></i>'
      cardHTML += '</span></div>'
    }
    if (isEditable) {
      cardHTML += '<div class="level-item">'
      cardHTML += `<a href="${shiftLog.urlPrefix}/shifts/${shift.shiftId}/edit" class="button is-small is-light">`
      cardHTML += '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>'
      cardHTML += '</a></div>'
    }
    cardHTML += '</div></div>'

    // Shift details
    cardHTML += '<div class="content is-small">'
    cardHTML += `<p class="mb-2"><strong>Time:</strong> ${cityssm.escapeHTML(shift.shiftTimeDataListItem ?? '')}</p>`
    cardHTML += `<p class="mb-2"><strong>Supervisor:</strong> ${cityssm.escapeHTML(shift.supervisorLastName ?? '')}, ${cityssm.escapeHTML(shift.supervisorFirstName ?? '')}</p>`
    if (shift.shiftDescription !== '') {
      cardHTML += `<p class="mb-2"><strong>Description:</strong> ${cityssm.escapeHTML(shift.shiftDescription)}</p>`
    }
    cardHTML += '</div>'

    cardHTML += '<hr class="my-3" />'

    // View-specific content
    if (viewMode === 'employees') {
      cardHTML += renderEmployeesView(shift, duplicates)
    } else {
      cardHTML += renderTasksView(shift, duplicates)
    }

    cardHTML += '</div>'

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    cardElement.innerHTML = cardHTML

    return cardElement
  }

  function renderShifts(): void {
    resultsContainerElement.innerHTML = ''

    if (currentShifts.length === 0) {
      resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <div class="message-body">
            No shifts found for the selected date.
          </div>
        </div>
      `
      return
    }

    const duplicates = findDuplicates(currentShifts)
    const viewMode = viewModeElement.value

    const columnsElement = document.createElement('div')
    columnsElement.className = 'columns is-multiline'

    for (const shift of currentShifts) {
      const shiftCard = renderShiftCard(shift, duplicates, viewMode)
      columnsElement.append(shiftCard)
    }

    resultsContainerElement.append(columnsElement)
  }

  function loadShifts(): void {
    const shiftDateString = shiftDateElement.value

    if (shiftDateString === '') {
      return
    }

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/shifts/doGetShiftsForBuilder`,
      {
        shiftDateString
      },
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as DoGetShiftsForBuilderResponse

        if (responseJSON.success) {
          currentShifts = responseJSON.shifts
          renderShifts()
        }
      }
    )
  }

  // Drag and drop state
  let draggedElement: HTMLElement | null = null
  let draggedData: {
    type: 'employee' | 'equipment' | 'crew' | 'workOrder'
    id: string | number
    fromShiftId: number
  } | null = null

  // Drag and drop handlers
  function handleDragStart(event: DragEvent): void {
    const target = event.target as HTMLElement
    draggedElement = target
    target.classList.add('is-dragging')

    const employeeNumber = target.dataset.employeeNumber
    const equipmentNumber = target.dataset.equipmentNumber
    const crewId = target.dataset.crewId
    const workorderId = target.dataset.workorderId

    const shiftCard = target.closest('[data-shift-id]') as HTMLElement
    const fromShiftId = Number.parseInt(shiftCard.dataset.shiftId ?? '0', 10)

    if (employeeNumber !== undefined) {
      draggedData = {
        type: 'employee',
        id: employeeNumber,
        fromShiftId
      }
    } else if (equipmentNumber !== undefined) {
      draggedData = {
        type: 'equipment',
        id: equipmentNumber,
        fromShiftId
      }
    } else if (crewId !== undefined) {
      draggedData = {
        type: 'crew',
        id: Number.parseInt(crewId, 10),
        fromShiftId
      }
    } else if (workorderId !== undefined) {
      draggedData = {
        type: 'workOrder',
        id: Number.parseInt(workorderId, 10),
        fromShiftId
      }
    }

    if (event.dataTransfer !== null) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  function handleDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement
    target.classList.remove('is-dragging')
    draggedElement = null
    draggedData = null

    // Remove all drop zone highlights
    document.querySelectorAll('.is-drop-target').forEach((element) => {
      element.classList.remove('is-drop-target')
    })
  }

  function handleDragOver(event: DragEvent): void {
    event.preventDefault()
    const target = event.target as HTMLElement

    // Highlight drop zones
    const shiftBox = target.closest('.box')
    if (shiftBox !== null) {
      shiftBox.classList.add('is-drop-target')
    }

    if (event.dataTransfer !== null) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  function handleDragLeave(event: DragEvent): void {
    const target = event.target as HTMLElement
    const shiftBox = target.closest('.box')
    if (shiftBox !== null) {
      shiftBox.classList.remove('is-drop-target')
    }
  }

  function handleDrop(event: DragEvent): void {
    event.preventDefault()

    const target = event.target as HTMLElement
    target.classList.remove('is-drop-target')

    if (draggedData === null) {
      return
    }

    const shiftCard = target.closest('[data-shift-id]') as HTMLElement
    const toShiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10)

    if (toShiftId === 0 || toShiftId === draggedData.fromShiftId) {
      return
    }

    // Handle different drop scenarios
    if (draggedData.type === 'employee') {
      moveEmployee(
        draggedData.id as string,
        draggedData.fromShiftId,
        toShiftId
      )
    } else if (draggedData.type === 'equipment') {
      moveEquipment(
        draggedData.id as string,
        draggedData.fromShiftId,
        toShiftId
      )
    } else if (draggedData.type === 'crew') {
      moveCrew(draggedData.id as number, draggedData.fromShiftId, toShiftId)
    } else if (draggedData.type === 'workOrder') {
      moveWorkOrder(
        draggedData.id as number,
        draggedData.fromShiftId,
        toShiftId
      )
    }
  }

  function moveEmployee(
    employeeNumber: string,
    fromShiftId: number,
    toShiftId: number
  ): void {
    // Delete from old shift
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/shifts/doDeleteShiftEmployee`,
      {
        shiftId: fromShiftId,
        employeeNumber
      },
      (deleteResponse) => {
        if (deleteResponse.success) {
          // Add to new shift
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/shifts/doAddShiftEmployee`,
            {
              shiftId: toShiftId,
              employeeNumber,
              shiftEmployeeNote: ''
            },
            (addResponse) => {
              if (addResponse.success) {
                cityssm.alertModal(
                  'Employee Moved',
                  'Employee has been moved to the new shift.',
                  'success',
                  'OK'
                )
                loadShifts()
              } else {
                cityssm.alertModal(
                  'Error',
                  'Failed to add employee to new shift.',
                  'danger',
                  'OK'
                )
              }
            }
          )
        } else {
          cityssm.alertModal(
            'Error',
            'Failed to remove employee from original shift.',
            'danger',
            'OK'
          )
        }
      }
    )
  }

  function moveEquipment(
    equipmentNumber: string,
    fromShiftId: number,
    toShiftId: number
  ): void {
    // Delete from old shift
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/shifts/doDeleteShiftEquipment`,
      {
        shiftId: fromShiftId,
        equipmentNumber
      },
      (deleteResponse) => {
        if (deleteResponse.success) {
          // Add to new shift
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/shifts/doAddShiftEquipment`,
            {
              shiftId: toShiftId,
              equipmentNumber,
              shiftEquipmentNote: ''
            },
            (addResponse) => {
              if (addResponse.success) {
                cityssm.alertModal(
                  'Equipment Moved',
                  'Equipment has been moved to the new shift.',
                  'success',
                  'OK'
                )
                loadShifts()
              } else {
                cityssm.alertModal(
                  'Error',
                  'Failed to add equipment to new shift.',
                  'danger',
                  'OK'
                )
              }
            }
          )
        } else {
          cityssm.alertModal(
            'Error',
            'Failed to remove equipment from original shift.',
            'danger',
            'OK'
          )
        }
      }
    )
  }

  function moveCrew(
    crewId: number,
    fromShiftId: number,
    toShiftId: number
  ): void {
    // Delete from old shift
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/shifts/doDeleteShiftCrew`,
      {
        shiftId: fromShiftId,
        crewId
      },
      (deleteResponse) => {
        if (deleteResponse.success) {
          // Add to new shift
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/shifts/doAddShiftCrew`,
            {
              shiftId: toShiftId,
              crewId,
              shiftCrewNote: ''
            },
            (addResponse) => {
              if (addResponse.success) {
                cityssm.alertModal(
                  'Crew Moved',
                  'Crew has been moved to the new shift.',
                  'success',
                  'OK'
                )
                loadShifts()
              } else {
                cityssm.alertModal(
                  'Error',
                  'Failed to add crew to new shift.',
                  'danger',
                  'OK'
                )
              }
            }
          )
        } else {
          cityssm.alertModal(
            'Error',
            'Failed to remove crew from original shift.',
            'danger',
            'OK'
          )
        }
      }
    )
  }

  function moveWorkOrder(
    workOrderId: number,
    fromShiftId: number,
    toShiftId: number
  ): void {
    // Delete from old shift
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/shifts/doDeleteShiftWorkOrder`,
      {
        shiftId: fromShiftId,
        workOrderId
      },
      (deleteResponse) => {
        if (deleteResponse.success) {
          // Add to new shift
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/shifts/doAddShiftWorkOrder`,
            {
              shiftId: toShiftId,
              workOrderId,
              shiftWorkOrderNote: ''
            },
            (addResponse) => {
              if (addResponse.success) {
                cityssm.alertModal(
                  'Work Order Moved',
                  'Work order has been moved to the new shift.',
                  'success',
                  'OK'
                )
                loadShifts()
              } else {
                cityssm.alertModal(
                  'Error',
                  'Failed to add work order to new shift.',
                  'danger',
                  'OK'
                )
              }
            }
          )
        } else {
          cityssm.alertModal(
            'Error',
            'Failed to remove work order from original shift.',
            'danger',
            'OK'
          )
        }
      }
    )
  }

  // Event listeners
  shiftDateElement.addEventListener('change', loadShifts)
  viewModeElement.addEventListener('change', renderShifts)

  // Set up drag and drop event delegation on the results container
  resultsContainerElement.addEventListener('dragstart', handleDragStart)
  resultsContainerElement.addEventListener('dragend', handleDragEnd)
  resultsContainerElement.addEventListener('dragover', handleDragOver)
  resultsContainerElement.addEventListener('dragleave', handleDragLeave)
  resultsContainerElement.addEventListener('drop', handleDrop)

  // Initialize flatpickr for date input
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ;(cityssm as any).initializeDatePickers(shiftDateElement)

  // Load shifts for today on page load
  loadShifts()
})()
