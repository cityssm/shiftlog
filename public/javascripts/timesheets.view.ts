import type { TimesheetGrid as TimesheetGridClass } from './timesheets.grid.js'

declare const TimesheetGrid: typeof TimesheetGridClass

;(() => {
  /*
   * Make form read only
   */

  const formElement = document.querySelector(
    '#form--timesheet'
  ) as HTMLFormElement | null

  formElement?.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  const inputElements = formElement?.querySelectorAll(
    'input, select, textarea'
  ) as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

  if (inputElements !== null) {
    for (let i = 0; i < inputElements.length; i++) {
      const inputElement = inputElements[i]
      inputElement.disabled = true

      if (inputElement.tagName.toLowerCase() !== 'select') {
        ;(inputElement as HTMLInputElement | HTMLTextAreaElement).readOnly = true
      }
    }
  }

  /*
   * Initialize timesheet grid (view-only mode)
   */

  const gridContainer = document.querySelector('#timesheet-grid-container') as HTMLElement | null
  const timesheetIdInput = document.querySelector('#timesheet--timesheetId') as HTMLInputElement | null

  if (gridContainer !== null && timesheetIdInput !== null && timesheetIdInput.value !== '') {
    const timesheetId = Number.parseInt(timesheetIdInput.value, 10)
    
    const grid = new TimesheetGrid(gridContainer, {
      timesheetId,
      isEditable: false,
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
  }
})()
