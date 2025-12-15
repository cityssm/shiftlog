import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type FlatPickr from 'flatpickr'
import type { DoGetShiftsForBuilderResponse } from '../../handlers/shifts-post/doGetShiftsForBuilder.js'
import type { ShiftForBuilder } from '../../database/shifts/getShiftsForBuilder.js'
import type { ShiftLogGlobal } from './types.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
declare const flatpickr: typeof FlatPickr

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
        const dropTargetClass = isEditable ? ' drop-target-crew' : ''
        html += `<li class="${dupClass}${dropTargetClass}" data-crew-id="${crew.crewId}" draggable="${isEditable}">`
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
        const dropTargetClass = isEditable ? ' drop-target-employee' : ''
        html += `<li class="${dupClass}${dropTargetClass}" data-employee-number="${employee.employeeNumber}" data-crew-id="${employee.crewId ?? ''}" draggable="${isEditable}">`
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
        if (workOrder.workOrderDetails !== '') {
          html += ` - ${cityssm.escapeHTML(workOrder.workOrderDetails)}`
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
    cardHTML += `#${shift.shiftId} - ${cityssm.escapeHTML(shift.shiftTypeDataListItem ?? 'Shift')}`
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
    // Make supervisor field a drop target for employees
    const supervisorDropClass = isEditable ? ' drop-target-supervisor' : ''
    cardHTML += `<p class="mb-2${supervisorDropClass}" data-shift-id="${shift.shiftId}" data-supervisor-employee-number="${shift.supervisorEmployeeNumber}"><strong>Supervisor:</strong> ${cityssm.escapeHTML(shift.supervisorLastName ?? '')}, ${cityssm.escapeHTML(shift.supervisorFirstName ?? '')}</p>`
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
          loadAvailableResources()
        }
      }
    )
  }

  function loadAvailableResources(): void {
    const shiftDateString = shiftDateElement.value

    if (shiftDateString === '') {
      return
    }

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/shifts/doGetAvailableResources`,
      {
        shiftDateString
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          employees: Array<{ employeeNumber: string; firstName: string; lastName: string }>
          equipment: Array<{ equipmentNumber: string; equipmentName: string }>
          crews: Array<{ crewId: number; crewName: string }>
        }

        if (responseJSON.success) {
          renderAvailableResources(responseJSON)
        }
      }
    )
  }

  function renderAvailableResources(resources: {
    employees: Array<{ employeeNumber: string; firstName: string; lastName: string }>
    equipment: Array<{ equipmentNumber: string; equipmentName: string }>
    crews: Array<{ crewId: number; crewName: string }>
  }): void {
    // Render employees
    const employeesList = document.querySelector('#available--employees .available-resources-list') as HTMLElement
    if (employeesList !== null) {
      if (resources.employees.length === 0) {
        employeesList.innerHTML = '<p class="has-text-grey-light is-size-7">No available employees</p>'
      } else {
        let html = '<div class="available-items">'
        for (const employee of resources.employees) {
          html += `<div class="box is-paddingless p-2 mb-2 is-clickable" draggable="true" data-employee-number="${employee.employeeNumber}" data-from-available="true">`
          html += `<span class="is-size-7">${cityssm.escapeHTML(employee.lastName)}, ${cityssm.escapeHTML(employee.firstName)}</span>`
          html += '</div>'
        }
        html += '</div>'
        employeesList.innerHTML = html
      }
    }

    // Render equipment
    const equipmentList = document.querySelector('#available--equipment .available-resources-list') as HTMLElement
    if (equipmentList !== null) {
      if (resources.equipment.length === 0) {
        equipmentList.innerHTML = '<p class="has-text-grey-light is-size-7">No available equipment</p>'
      } else {
        let html = '<div class="available-items">'
        for (const equipment of resources.equipment) {
          html += `<div class="box is-paddingless p-2 mb-2 is-clickable" draggable="true" data-equipment-number="${equipment.equipmentNumber}" data-from-available="true">`
          html += `<span class="is-size-7">${cityssm.escapeHTML(equipment.equipmentName)}</span>`
          html += '</div>'
        }
        html += '</div>'
        equipmentList.innerHTML = html
      }
    }

    // Render crews
    const crewsList = document.querySelector('#available--crews .available-resources-list') as HTMLElement
    if (crewsList !== null) {
      if (resources.crews.length === 0) {
        crewsList.innerHTML = '<p class="has-text-grey-light is-size-7">No available crews</p>'
      } else {
        let html = '<div class="available-items">'
        for (const crew of resources.crews) {
          html += `<div class="box is-paddingless p-2 mb-2 is-clickable" draggable="true" data-crew-id="${crew.crewId}" data-from-available="true">`
          html += `<span class="is-size-7">${cityssm.escapeHTML(crew.crewName)}</span>`
          html += '</div>'
        }
        html += '</div>'
        crewsList.innerHTML = html
      }
    }
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
    const fromAvailable = target.dataset.fromAvailable === 'true'

    const shiftCard = target.closest('[data-shift-id]') as HTMLElement
    const fromShiftId = fromAvailable ? 0 : Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10)

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

    // Remove existing highlights
    document.querySelectorAll('.is-drop-target').forEach((element) => {
      element.classList.remove('is-drop-target')
    })

    // Check if hovering over available resources sidebar (to remove from shift)
    const availableResourcesSidebar = target.closest('#container--availableResources')
    if (availableResourcesSidebar !== null && draggedData !== null && draggedData.fromShiftId > 0) {
      // Highlight the sidebar box when dragging from a shift to remove
      const sidebarBox = availableResourcesSidebar.querySelector('.box')
      if (sidebarBox !== null) {
        sidebarBox.classList.add('is-drop-target')
      }
      if (event.dataTransfer !== null) {
        event.dataTransfer.dropEffect = 'move'
      }
      return
    }

    // Check for specific drop targets first
    const supervisorTarget = target.closest('.drop-target-supervisor') as HTMLElement
    const crewTarget = target.closest('.drop-target-crew') as HTMLElement
    const employeeTarget = target.closest('.drop-target-employee') as HTMLElement

    // Highlight specific drop targets based on what's being dragged
    if (draggedData?.type === 'employee' && supervisorTarget !== null) {
      supervisorTarget.classList.add('is-drop-target')
    } else if (draggedData?.type === 'employee' && crewTarget !== null) {
      crewTarget.classList.add('is-drop-target')
    } else if (draggedData?.type === 'equipment' && employeeTarget !== null) {
      employeeTarget.classList.add('is-drop-target')
    } else {
      // Default: highlight entire shift box
      const shiftBox = target.closest('.box')
      if (shiftBox !== null && !shiftBox.closest('#container--availableResources')) {
        shiftBox.classList.add('is-drop-target')
      }
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

    // Check if dropped on available resources sidebar (to remove from shift)
    const availableResourcesSidebar = target.closest('#container--availableResources')
    if (availableResourcesSidebar !== null && draggedData.fromShiftId > 0) {
      removeFromShift(draggedData)
      return
    }

    // Check for specific drop targets first
    const supervisorTarget = target.closest('.drop-target-supervisor') as HTMLElement
    const crewTarget = target.closest('.drop-target-crew') as HTMLElement
    const employeeTarget = target.closest('.drop-target-employee') as HTMLElement

    // Handle employee dropped on supervisor slot
    if (supervisorTarget !== null && draggedData.type === 'employee') {
      const shiftId = Number.parseInt(supervisorTarget.dataset.shiftId ?? '0', 10)
      if (shiftId > 0) {
        makeEmployeeSupervisor(draggedData.id as string, shiftId)
        return
      }
    }

    // Handle employee dropped on crew
    if (crewTarget !== null && draggedData.type === 'employee') {
      const shiftCard = crewTarget.closest('[data-shift-id]') as HTMLElement
      const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10)
      const crewId = Number.parseInt(crewTarget.dataset.crewId ?? '0', 10)
      
      if (shiftId > 0 && crewId > 0) {
        assignEmployeeToCrew(
          draggedData.id as string,
          draggedData.fromShiftId,
          shiftId,
          crewId
        )
        return
      }
    }

    // Handle equipment dropped on employee
    if (employeeTarget !== null && draggedData.type === 'equipment') {
      const shiftCard = employeeTarget.closest('[data-shift-id]') as HTMLElement
      const shiftId = Number.parseInt(shiftCard?.dataset.shiftId ?? '0', 10)
      const employeeNumber = employeeTarget.dataset.employeeNumber ?? ''
      
      if (shiftId > 0 && employeeNumber !== '') {
        assignEquipmentToEmployee(
          draggedData.id as string,
          draggedData.fromShiftId,
          shiftId,
          employeeNumber
        )
        return
      }
    }

    // Default: move to shift
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

  function removeFromShift(draggedData: {
    type: 'employee' | 'equipment' | 'crew' | 'workOrder'
    id: string | number
    fromShiftId: number
  }): void {
    if (draggedData.type === 'employee') {
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doDeleteShiftEmployee`,
        {
          shiftId: draggedData.fromShiftId,
          employeeNumber: draggedData.id
        },
        (response) => {
          if (response.success) {
            bulmaJS.alert({ contextualColorName: 'success', message: 'Employee removed from shift.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove employee from shift.' })
          }
        }
      )
    } else if (draggedData.type === 'equipment') {
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doDeleteShiftEquipment`,
        {
          shiftId: draggedData.fromShiftId,
          equipmentNumber: draggedData.id
        },
        (response) => {
          if (response.success) {
            bulmaJS.alert({ contextualColorName: 'success', message: 'Equipment removed from shift.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove equipment from shift.' })
          }
        }
      )
    } else if (draggedData.type === 'crew') {
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doDeleteShiftCrew`,
        {
          shiftId: draggedData.fromShiftId,
          crewId: draggedData.id
        },
        (response) => {
          if (response.success) {
            bulmaJS.alert({ contextualColorName: 'success', message: 'Crew removed from shift.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove crew from shift.' })
          }
        }
      )
    }
  }

  function moveEmployee(
    employeeNumber: string,
    fromShiftId: number,
    toShiftId: number
  ): void {
    // If fromShiftId is 0, employee is from available resources
    if (fromShiftId === 0) {
      // Just add to new shift
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doAddShiftEmployee`,
        {
          shiftId: toShiftId,
          employeeNumber,
          shiftEmployeeNote: ''
        },
        (addResponse) => {
          if (addResponse.success) {
            bulmaJS.alert({ contextualColorName: 'success', title: 'Employee Added', message: 'Employee has been added to the shift.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add employee to shift.' })
          }
        }
      )
      return
    }

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
                bulmaJS.alert({ contextualColorName: 'success', title: 'Employee Moved', message: 'Employee has been moved to the new shift.' })
                loadShifts()
              } else {
                bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add employee to new shift.' })
              }
            }
          )
        } else {
          bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove employee from original shift.' })
        }
      }
    )
  }

  function moveEquipment(
    equipmentNumber: string,
    fromShiftId: number,
    toShiftId: number
  ): void {
    // If fromShiftId is 0, equipment is from available resources
    if (fromShiftId === 0) {
      // Just add to new shift
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doAddShiftEquipment`,
        {
          shiftId: toShiftId,
          equipmentNumber,
          shiftEquipmentNote: ''
        },
        (addResponse) => {
          if (addResponse.success) {
            bulmaJS.alert({ contextualColorName: 'success', title: 'Equipment Added', message: 'Equipment has been added to the shift.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add equipment to shift.' })
          }
        }
      )
      return
    }

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
                bulmaJS.alert({ contextualColorName: 'success', title: 'Equipment Moved', message: 'Equipment has been moved to the new shift.' })
                loadShifts()
              } else {
                bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add equipment to new shift.' })
              }
            }
          )
        } else {
          bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove equipment from original shift.' })
        }
      }
    )
  }

  function moveCrew(
    crewId: number,
    fromShiftId: number,
    toShiftId: number
  ): void {
    // If fromShiftId is 0, crew is from available resources
    if (fromShiftId === 0) {
      // Just add to new shift
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doAddShiftCrew`,
        {
          shiftId: toShiftId,
          crewId,
          shiftCrewNote: ''
        },
        (addResponse) => {
          if (addResponse.success) {
            bulmaJS.alert({ contextualColorName: 'success', title: 'Crew Added', message: 'Crew has been added to the shift.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add crew to shift.' })
          }
        }
      )
      return
    }

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
                bulmaJS.alert({ contextualColorName: 'success', title: 'Crew Moved', message: 'Crew has been moved to the new shift.' })
                loadShifts()
              } else {
                bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add crew to new shift.' })
              }
            }
          )
        } else {
          bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove crew from original shift.' })
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
                bulmaJS.alert({ contextualColorName: 'success', title: 'Work Order Moved', message: 'Work order has been moved to the new shift.' })
                loadShifts()
              } else {
                bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add work order to new shift.' })
              }
            }
          )
        } else {
          bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove work order from original shift.' })
        }
      }
    )
  }

  function makeEmployeeSupervisor(
    employeeNumber: string,
    shiftId: number
  ): void {
    // Get the shift details first to get current values
    const shift = currentShifts.find((s) => s.shiftId === shiftId)
    if (shift === undefined) {
      return
    }

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/shifts/doUpdateShift`,
      {
        shiftId,
        shiftTypeDataListItemId: shift.shiftTypeDataListItemId,
        supervisorEmployeeNumber: employeeNumber,
        shiftDateString: shift.shiftDate,
        shiftTimeDataListItemId: shift.shiftTimeDataListItemId,
        shiftDescription: shift.shiftDescription
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean }
        if (responseJSON.success) {
          bulmaJS.alert({ contextualColorName: 'success', title: 'Supervisor Updated', message: 'Employee has been set as the supervisor for this shift.' })
          loadShifts()
        } else {
          bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to update shift supervisor.' })
        }
      }
    )
  }

  function assignEmployeeToCrew(
    employeeNumber: string,
    fromShiftId: number,
    toShiftId: number,
    crewId: number
  ): void {
    // If employee is on a different shift, move them first
    if (fromShiftId !== toShiftId) {
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doDeleteShiftEmployee`,
        {
          shiftId: fromShiftId,
          employeeNumber
        },
        (deleteResponse) => {
          if (deleteResponse.success) {
            // Add to new shift with crew assignment
            cityssm.postJSON(
              `${shiftLog.urlPrefix}/shifts/doAddShiftEmployee`,
              {
                shiftId: toShiftId,
                employeeNumber,
                crewId,
                shiftEmployeeNote: ''
              },
              (addResponse) => {
                if (addResponse.success) {
                  bulmaJS.alert({ contextualColorName: 'success', title: 'Employee Assigned', message: 'Employee has been moved and assigned to the crew.' })
                  loadShifts()
                } else {
                  bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add employee to crew.' })
                }
              }
            )
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove employee from original shift.' })
          }
        }
      )
    } else {
      // Same shift, just update the crew assignment
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doUpdateShiftEmployee`,
        {
          shiftId: toShiftId,
          employeeNumber,
          crewId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }
          if (responseJSON.success) {
            bulmaJS.alert({ contextualColorName: 'success', title: 'Employee Assigned', message: 'Employee has been assigned to the crew.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to assign employee to crew.' })
          }
        }
      )
    }
  }

  function assignEquipmentToEmployee(
    equipmentNumber: string,
    fromShiftId: number,
    toShiftId: number,
    employeeNumber: string
  ): void {
    // If equipment is on a different shift, move it first
    if (fromShiftId !== toShiftId) {
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doDeleteShiftEquipment`,
        {
          shiftId: fromShiftId,
          equipmentNumber
        },
        (deleteResponse) => {
          if (deleteResponse.success) {
            // Add to new shift with employee assignment
            cityssm.postJSON(
              `${shiftLog.urlPrefix}/shifts/doAddShiftEquipment`,
              {
                shiftId: toShiftId,
                equipmentNumber,
                employeeNumber,
                shiftEquipmentNote: ''
              },
              (addResponse) => {
                if (addResponse.success) {
                  bulmaJS.alert({ contextualColorName: 'success', title: 'Equipment Assigned', message: 'Equipment has been moved and assigned to the employee.' })
                  loadShifts()
                } else {
                  bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to add equipment to shift.' })
                }
              }
            )
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to remove equipment from original shift.' })
          }
        }
      )
    } else {
      // Same shift, just update the employee assignment
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/shifts/doUpdateShiftEquipment`,
        {
          shiftId: toShiftId,
          equipmentNumber,
          employeeNumber
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }
          if (responseJSON.success) {
            bulmaJS.alert({ contextualColorName: 'success', title: 'Equipment Assigned', message: 'Equipment has been assigned to the employee.' })
            loadShifts()
          } else {
            bulmaJS.alert({ contextualColorName: 'danger', title: 'Error', message: 'Failed to assign equipment to employee.' })
          }
        }
      )
    }
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

  // Set up drag and drop for available resources sidebar
  const availableResourcesContainer = document.querySelector('#container--availableResources')
  if (availableResourcesContainer !== null) {
    availableResourcesContainer.addEventListener('dragstart', handleDragStart)
    availableResourcesContainer.addEventListener('dragend', handleDragEnd)
    availableResourcesContainer.addEventListener('dragover', handleDragOver)
    availableResourcesContainer.addEventListener('dragleave', handleDragLeave)
    availableResourcesContainer.addEventListener('drop', handleDrop)
  }

  // Initialize flatpickr for date input
  if (typeof flatpickr !== 'undefined') {
    flatpickr(shiftDateElement, {
      allowInput: true,
      dateFormat: 'Y-m-d',
      nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
      prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
    })
  }

  // Create shift modal
  function openCreateShiftModal(): void {
    const selectedDate = shiftDateElement.value
    if (selectedDate === '') {
      bulmaJS.alert({
        contextualColorName: 'warning',
        message: 'Please select a date first.'
      })
      return
    }

    let closeModalFunction: () => void

    cityssm.openHtmlModal('shifts-createShift', {
      onshow(modalElement) {
        const formElement = modalElement.querySelector('#form--createShift') as HTMLFormElement
        
        // Set the date
        const dateInput = formElement.querySelector('[name="shiftDateString"]') as HTMLInputElement
        dateInput.value = selectedDate

        const shiftTypeSelect = modalElement.querySelector('#createShift--shiftTypeDataListItemId') as HTMLSelectElement
        const shiftTimeSelect = modalElement.querySelector('#createShift--shiftTimeDataListItemId') as HTMLSelectElement
        const supervisorSelect = modalElement.querySelector('#createShift--supervisorEmployeeNumber') as HTMLSelectElement

        // Load shift types, times, and supervisors
        cityssm.postJSON(
          `${shiftLog.urlPrefix}/shifts/doGetShiftCreationData`,
          {},
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              shiftTypes: Array<{ dataListItemId: number; dataListItem: string }>
              shiftTimes: Array<{ dataListItemId: number; dataListItem: string }>
              supervisors: Array<{ employeeNumber: string; firstName: string; lastName: string }>
            }

            if (responseJSON.success) {
              // Populate shift types
              for (const shiftType of responseJSON.shiftTypes) {
                const optionElement = document.createElement('option')
                optionElement.value = shiftType.dataListItemId.toString()
                optionElement.textContent = shiftType.dataListItem
                shiftTypeSelect.append(optionElement)
              }

              // Populate shift times
              for (const shiftTime of responseJSON.shiftTimes) {
                const optionElement = document.createElement('option')
                optionElement.value = shiftTime.dataListItemId.toString()
                optionElement.textContent = shiftTime.dataListItem
                shiftTimeSelect.append(optionElement)
              }

              // Populate supervisors
              for (const supervisor of responseJSON.supervisors) {
                const optionElement = document.createElement('option')
                optionElement.value = supervisor.employeeNumber
                optionElement.textContent = `${supervisor.lastName}, ${supervisor.firstName}`
                supervisorSelect.append(optionElement)
              }
            }
          }
        )

        // Handle form submission
        formElement.addEventListener('submit', (submitEvent) => {
          submitEvent.preventDefault()

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/shifts/doCreateShift`,
            formElement,
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                shiftId?: number
                errorMessage?: string
              }

              if (responseJSON.success) {
                bulmaJS.alert({
                  contextualColorName: 'success',
                  message: 'Shift created successfully!'
                })
                closeModalFunction()
                loadShifts()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Creation Error',
                  message: responseJSON.errorMessage ?? 'Failed to create shift.'
                })
              }
            }
          )
        })
      },
      onshown(modalElement, closeFunction) {
        closeModalFunction = closeFunction
      }
    })
  }

  // Create shift button handler
  const createShiftButton = document.querySelector('#button--createShift')
  if (createShiftButton !== null) {
    createShiftButton.addEventListener('click', openCreateShiftModal)
  }

  // Load shifts for today on page load
  loadShifts()
})()
