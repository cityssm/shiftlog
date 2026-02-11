import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal
  TimesheetGrid: new (
    containerElement: HTMLElement,
    config: {
      timesheetId: number
      isEditable: boolean
      hideEmptyRows: boolean
      hideEmptyColumns: boolean
      filterRows: string
    }
  ) => {
    init(): Promise<void>
    setDisplayOptions(options: {
      hideEmptyRows?: boolean
      hideEmptyColumns?: boolean
      filterRows?: string
    }): void
  }
}
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

  inputElements?.forEach((inputElement) => {
    inputElement.disabled = true

    if (inputElement.tagName.toLowerCase() !== 'select') {
      ;(inputElement as HTMLInputElement | HTMLTextAreaElement).readOnly = true
    }
  })

  /*
   * Initialize timesheet grid (view-only mode)
   */

  const gridContainer = document.querySelector(
    '#timesheet-grid-container'
  ) as HTMLElement | null
  const timesheetIdInput = document.querySelector(
    '#timesheet--timesheetId'
  ) as HTMLInputElement | null

  if (
    gridContainer !== null &&
    timesheetIdInput !== null &&
    timesheetIdInput.value !== ''
  ) {
    const timesheetId = Number.parseInt(timesheetIdInput.value, 10)

    const grid = new exports.TimesheetGrid(gridContainer, {
      timesheetId,
      isEditable: false,
      hideEmptyRows: false,
      hideEmptyColumns: false,
      filterRows: ''
    })

    // Display options
    const hideEmptyRowsCheckbox = document.querySelector(
      '#display--hideEmptyRows'
    ) as HTMLInputElement | null
    const hideEmptyColumnsCheckbox = document.querySelector(
      '#display--hideEmptyColumns'
    ) as HTMLInputElement | null
    const filterRowsInput = document.querySelector(
      '#display--filterRows'
    ) as HTMLInputElement | null

    if (hideEmptyRowsCheckbox !== null) {
      hideEmptyRowsCheckbox.addEventListener('change', () => {
        grid.setDisplayOptions({ hideEmptyRows: hideEmptyRowsCheckbox.checked })
      })
    }

    if (hideEmptyColumnsCheckbox !== null) {
      hideEmptyColumnsCheckbox.addEventListener('change', () => {
        grid.setDisplayOptions({
          hideEmptyColumns: hideEmptyColumnsCheckbox.checked
        })
      })
    }

    if (filterRowsInput !== null) {
      filterRowsInput.addEventListener('input', () => {
        grid.setDisplayOptions({ filterRows: filterRowsInput.value })
      })
    }

    // Initialize grid
    grid.init().catch((error) => {
      console.error('Error initializing grid:', error)
    })
  }
})()
