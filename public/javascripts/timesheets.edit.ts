import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { BulmaJS } from '@cityssm/bulma-js/types.js'

import type { Shift } from '../../record.types.js'
import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
  TimesheetGrid: new (containerElement: HTMLElement, config: {
    timesheetId: number
    isEditable: boolean
    hideEmptyRows: boolean
    hideEmptyColumns: boolean
  }) => {
    init(): Promise<void>
    setDisplayOptions(options: { hideEmptyRows?: boolean; hideEmptyColumns?: boolean }): void
  }
}
;(() => {
  const shiftLog = exports.shiftLog

  const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.timesheetsRouter}`

  const formElement = document.querySelector(
    '#form--timesheet'
  ) as HTMLFormElement

  const timesheetIdElement = formElement.querySelector(
    '#timesheet--timesheetId'
  ) as HTMLInputElement

  const isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1'

  /*
   * Load available shifts based on supervisor and date
   */
  
  const supervisorElement = formElement.querySelector(
    '#timesheet--supervisorEmployeeNumber'
  ) as HTMLSelectElement | null

  const timesheetDateElement = formElement.querySelector(
    '#timesheet--timesheetDateString'
  ) as HTMLInputElement | null

  const shiftIdElement = formElement.querySelector(
    '#timesheet--shiftId'
  ) as HTMLSelectElement | null

  function loadAvailableShifts(): void {
    if (supervisorElement === null || timesheetDateElement === null || shiftIdElement === null) {
      return
    }

    const supervisorEmployeeNumber = supervisorElement.value
    const shiftDateString = timesheetDateElement.value

    if (supervisorEmployeeNumber === '' || shiftDateString === '') {
      // Clear shift dropdown except the "No Shift" option
      shiftIdElement.innerHTML = '<option value="">(No Shift)</option>'
      return
    }

    cityssm.postJSON(
      `${urlPrefix}/doGetAvailableShifts`,
      {
        supervisorEmployeeNumber,
        shiftDateString
      },
      (rawResponseJSON) => {
        const response = rawResponseJSON as {
          success: boolean
          shifts?: Shift[]
        }

        if (response.success && response.shifts !== undefined) {
          // Check if we have a temporarily stored shift ID (from initial page load)
          const tempShiftId = shiftIdElement.getAttribute('data-temp-shift-id')
          const currentShiftId = tempShiftId ?? shiftIdElement.value

          // Rebuild shift dropdown
          shiftIdElement.innerHTML = '<option value="">(No Shift)</option>'

          for (const shift of response.shifts) {
            const optionElement = document.createElement('option')
            optionElement.value = shift.shiftId.toString()
            optionElement.textContent = `Shift #${shift.shiftId} - ${shift.shiftTimeDataListItem ?? ''} (${shift.shiftDescription})`
            
            if (shift.shiftId.toString() === currentShiftId) {
              optionElement.selected = true
            }

            shiftIdElement.append(optionElement)
          }
          
          // Clear the temporary attribute after first load
          if (tempShiftId !== null) {
            shiftIdElement.removeAttribute('data-temp-shift-id')
          }
        }
      }
    )
  }

  // Load shifts when supervisor or date changes
  if (supervisorElement !== null) {
    supervisorElement.addEventListener('change', loadAvailableShifts)
  }

  if (timesheetDateElement !== null) {
    timesheetDateElement.addEventListener('change', loadAvailableShifts)
  }

  // Load shifts on page load (for both create and edit modes)
  if (supervisorElement !== null && timesheetDateElement !== null) {
    // Get initial shift ID from data attribute
    const initialShiftId = shiftIdElement?.getAttribute('data-initial-value') ?? ''
    
    // Store it temporarily
    if (shiftIdElement !== null && initialShiftId !== '') {
      shiftIdElement.setAttribute('data-temp-shift-id', initialShiftId)
    }
    
    loadAvailableShifts()
  }

  function doSaveTimesheet(
    formEvent: SubmitEvent
  ): void {
    formEvent.preventDefault()

    const endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet'

    cityssm.postJSON(
      `${urlPrefix}/${endpoint}`,
      formElement,
      (rawResponseJSON) => {
        const result = rawResponseJSON as {
          success: boolean
          timesheetId?: number
        }

        if (result.success) {
          if (isCreate) {
            globalThis.location.href = `${urlPrefix}/${result.timesheetId ?? ''}/edit`
          } else {
            bulmaJS.alert({
              contextualColorName: 'success',
              message: 'Timesheet updated successfully.'
            })
          }
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            message: 'An error occurred while saving the timesheet.'
          })
        }
      }
    )
  }

  formElement.addEventListener('submit', doSaveTimesheet)

  /*
   * Initialize timesheet grid (edit mode)
   */

  if (!isCreate) {
    const gridContainer = document.querySelector('#timesheet-grid-container') as HTMLElement | null

    if (gridContainer !== null) {
      const timesheetId = Number.parseInt(timesheetIdElement.value, 10)
      
      const grid = new exports.TimesheetGrid(gridContainer, {
        timesheetId,
        isEditable: true,
        hideEmptyRows: false,
        hideEmptyColumns: false
      })

      // Display options
      const hideEmptyRowsCheckbox = document.querySelector('#display--hideEmptyRows') as HTMLInputElement | null
      const hideEmptyColumnsCheckbox = document.querySelector('#display--hideEmptyColumns') as HTMLInputElement | null

      if (hideEmptyRowsCheckbox !== null) {
        hideEmptyRowsCheckbox.addEventListener('change', () => {
          grid.setDisplayOptions({ hideEmptyRows: hideEmptyRowsCheckbox.checked })
        })
      }

      if (hideEmptyColumnsCheckbox !== null) {
        hideEmptyColumnsCheckbox.addEventListener('change', () => {
          grid.setDisplayOptions({ hideEmptyColumns: hideEmptyColumnsCheckbox.checked })
        })
      }

      // Initialize grid
      grid.init().catch((error) => {
        console.error('Error initializing grid:', error)
      })

      // Add column button
      const addColumnButton = document.querySelector('#button--addColumn') as HTMLButtonElement | null
      if (addColumnButton !== null) {
        addColumnButton.addEventListener('click', () => {
          // TODO: Show add column modal
          console.log('Add column')
        })
      }

      // Add row button
      const addRowButton = document.querySelector('#button--addRow') as HTMLButtonElement | null
      if (addRowButton !== null) {
        addRowButton.addEventListener('click', () => {
          // TODO: Show add row modal
          console.log('Add row')
        })
      }

      // Copy from shift button
      const copyFromShiftButton = document.querySelector('#button--copyFromShift') as HTMLButtonElement | null
      if (copyFromShiftButton !== null) {
        copyFromShiftButton.addEventListener('click', () => {
          // TODO: Show copy from shift modal
          console.log('Copy from shift')
        })
      }

      // Copy from previous timesheet button
      const copyFromPreviousButton = document.querySelector('#button--copyFromPrevious') as HTMLButtonElement | null
      if (copyFromPreviousButton !== null) {
        copyFromPreviousButton.addEventListener('click', () => {
          // TODO: Show copy from previous modal
          console.log('Copy from previous')
        })
      }
    }
  }
})()
