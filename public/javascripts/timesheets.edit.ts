import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { BulmaJS } from '@cityssm/bulma-js/types.js'

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

      // Initialize dropdown
      const dropdownElement = document.querySelector('#dropdown--add') as HTMLElement | null
      if (dropdownElement !== null) {
        const dropdownTrigger = dropdownElement.querySelector('.dropdown-trigger button') as HTMLButtonElement | null
        if (dropdownTrigger !== null) {
          dropdownTrigger.addEventListener('click', () => {
            dropdownElement.classList.toggle('is-active')
          })
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
          if (!dropdownElement.contains(event.target as Node)) {
            dropdownElement.classList.remove('is-active')
          }
        })
      }

      // Add column button
      const addColumnButton = document.querySelector('#button--addColumn') as HTMLAnchorElement | null
      if (addColumnButton !== null) {
        addColumnButton.addEventListener('click', (event) => {
          event.preventDefault()
          dropdownElement?.classList.remove('is-active')
          // TODO: Show add column modal
          console.log('Add column')
        })
      }

      // Add row button
      const addRowButton = document.querySelector('#button--addRow') as HTMLAnchorElement | null
      if (addRowButton !== null) {
        addRowButton.addEventListener('click', (event) => {
          event.preventDefault()
          dropdownElement?.classList.remove('is-active')
          // TODO: Show add row modal
          console.log('Add row')
        })
      }

      // Copy from shift button
      const copyFromShiftButton = document.querySelector('#button--copyFromShift') as HTMLAnchorElement | null
      if (copyFromShiftButton !== null) {
        copyFromShiftButton.addEventListener('click', (event) => {
          event.preventDefault()
          dropdownElement?.classList.remove('is-active')
          // TODO: Show copy from shift modal
          console.log('Copy from shift')
        })
      }

      // Copy from previous timesheet button
      const copyFromPreviousButton = document.querySelector('#button--copyFromPrevious') as HTMLAnchorElement | null
      if (copyFromPreviousButton !== null) {
        copyFromPreviousButton.addEventListener('click', (event) => {
          event.preventDefault()
          dropdownElement?.classList.remove('is-active')
          // TODO: Show copy from previous modal
          console.log('Copy from previous')
        })
      }
    }
  }
})()
