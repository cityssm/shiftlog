/* eslint-disable max-lines */

// Timesheet Grid Management
import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type {
  TimesheetCell,
  TimesheetColumn,
  TimesheetRow
} from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
  TimesheetGrid?: typeof TimesheetGrid
}

interface TimesheetGridConfig {
  timesheetId: number
  isEditable: boolean
  hideEmptyRows: boolean
  hideEmptyColumns: boolean
  filterRows: string
}

class TimesheetGrid {
  private readonly cells = new Map<string, TimesheetCell>()
  private columns: TimesheetColumn[] = []
  private readonly config: TimesheetGridConfig
  private readonly containerElement: HTMLElement
  private rows: TimesheetRow[] = []
  private readonly shiftLog: ShiftLogGlobal

  constructor(containerElement: HTMLElement, config: TimesheetGridConfig) {
    this.containerElement = containerElement
    this.config = config
    this.shiftLog = exports.shiftLog
  }

  private static getCellKey(rowId: number, columnId: number): string {
    return `${rowId}_${columnId}`
  }

  addColumn(): void {
    let closeModalFunction: () => void

    const doAddColumn = (submitEvent: Event): void => {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}/doAddTimesheetColumn`,
        addForm,
        (result: {
          success: boolean
          timesheetColumnId?: number
        }) => {
          if (result.success) {
            closeModalFunction()
            this.loadData()
              .then(() => {
                this.render()
              })
              .catch((error: unknown) => {
                console.error('Error reloading data:', error)
              })
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Column Added',

              message: 'The column has been successfully added.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Column',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('timesheets-addColumn', {
      onshow: (modalElement) => {
        // Set the timesheet ID
        ;(
          modalElement.querySelector(
            '#addTimesheetColumn--timesheetId'
          ) as HTMLInputElement
        ).value = this.config.timesheetId.toString()

        // Clear form fields
        ;(
          modalElement.querySelector(
            '#addTimesheetColumn--columnTitle'
          ) as HTMLInputElement
        ).value = ''
        ;(
          modalElement.querySelector(
            '#addTimesheetColumn--workOrderNumber'
          ) as HTMLInputElement
        ).value = ''
        ;(
          modalElement.querySelector(
            '#addTimesheetColumn--costCenterA'
          ) as HTMLInputElement
        ).value = ''
        ;(
          modalElement.querySelector(
            '#addTimesheetColumn--costCenterB'
          ) as HTMLInputElement
        ).value = ''

        // Attach form submit handler
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddColumn)
      },
      onshown(_modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  addRow(): void {
    let closeModalFunction: () => void

    const doAddRow = (submitEvent: Event): void => {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement
      const formData = new FormData(addForm)

      // Convert empty strings to null for foreign key fields
      const requestData: Record<string, string | null> = {}
      for (const [key, value] of formData.entries()) {
        const stringValue = value.toString()
        if (
          key === 'jobClassificationDataListItemId' ||
          key === 'timeCodeDataListItemId'
        ) {
          requestData[key] = stringValue === '' ? null : stringValue
        } else {
          requestData[key] = stringValue === '' ? null : stringValue
        }
      }

      cityssm.postJSON(
        `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}/doAddTimesheetRow`,
        requestData,
        (result: {
          success: boolean
          timesheetRowId?: number
        }) => {
          if (result.success) {
            closeModalFunction()
            this.loadData()
              .then(() => {
                this.render()
              })
              .catch((error: unknown) => {
                console.error('Error reloading data:', error)
              })
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Row Added',

              message: 'The row has been successfully added.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Row',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    // Load options for the modal
    cityssm.postJSON(
      `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}/doGetTimesheetRowOptions`,
      {},
      (optionsData: {
        success: boolean

        employees: Array<{
          employeeNumber: string
          firstName: string
          lastName: string
        }>
        equipment: Array<{ equipmentNumber: string; equipmentName: string }>
        jobClassifications: Array<{
          dataListItemId: number
          dataListItem: string
        }>
        timeCodes: Array<{ dataListItemId: number; dataListItem: string }>
      }) => {
        if (!optionsData.success) {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error',

            message: 'Failed to load row options.'
          })
          return
        }

        cityssm.openHtmlModal('timesheets-addRow', {
          onshow: (modalElement) => {
            // Set the timesheet ID
            ;(
              modalElement.querySelector(
                '#addTimesheetRow--timesheetId'
              ) as HTMLInputElement
            ).value = this.config.timesheetId.toString()

            // Clear form fields
            const rowTitleInput = modalElement.querySelector(
              '#addTimesheetRow--rowTitle'
            ) as HTMLInputElement
            rowTitleInput.value = ''

            // Populate employees
            const employeeSelect = modalElement.querySelector(
              '#addTimesheetRow--employeeNumber'
            ) as HTMLSelectElement

            employeeSelect.innerHTML = '<option value="">(None)</option>'

            for (const employee of optionsData.employees) {
              employeeSelect.insertAdjacentHTML(
                'beforeend',
                `<option value="${cityssm.escapeHTML(employee.employeeNumber)}">${cityssm.escapeHTML(employee.lastName)}, ${cityssm.escapeHTML(employee.firstName)} (${cityssm.escapeHTML(employee.employeeNumber)})</option>`
              )
            }

            // Populate equipment
            const equipmentSelect = modalElement.querySelector(
              '#addTimesheetRow--equipmentNumber'
            ) as HTMLSelectElement

            equipmentSelect.innerHTML = '<option value="">(None)</option>'

            for (const equip of optionsData.equipment) {
              equipmentSelect.insertAdjacentHTML(
                'beforeend',
                `<option value="${cityssm.escapeHTML(equip.equipmentNumber)}">${cityssm.escapeHTML(equip.equipmentName)} (${cityssm.escapeHTML(equip.equipmentNumber)})</option>`
              )
            }

            // Auto-populate row title when employee or equipment is selected
            const updateRowTitle = (): void => {
              const selectedEquipment = equipmentSelect.value
              const selectedEmployee = employeeSelect.value

              // Equipment takes precedence
              if (selectedEquipment !== '') {
                const equipOption = optionsData.equipment.find(
                  (possibleEquipment) =>
                    possibleEquipment.equipmentNumber === selectedEquipment
                )

                if (equipOption !== undefined) {
                  rowTitleInput.value = equipOption.equipmentName
                }
              } else if (selectedEmployee !== '') {
                const empOption = optionsData.employees.find(
                  (possibleEmployee) =>
                    possibleEmployee.employeeNumber === selectedEmployee
                )

                if (empOption !== undefined) {
                  rowTitleInput.value = `${empOption.lastName}, ${empOption.firstName}`
                }
              }
            }

            employeeSelect.addEventListener('change', updateRowTitle)
            equipmentSelect.addEventListener('change', updateRowTitle)

            // Populate job classifications
            const jobClassSelect = modalElement.querySelector(
              '#addTimesheetRow--jobClassificationDataListItemId'
            ) as HTMLSelectElement

            jobClassSelect.innerHTML = '<option value="">(None)</option>'

            for (const jobClass of optionsData.jobClassifications) {
              jobClassSelect.insertAdjacentHTML(
                'beforeend',
                /* html */ `
                  <option value="${cityssm.escapeHTML(jobClass.dataListItemId.toString())}">
                    ${cityssm.escapeHTML(jobClass.dataListItem)}
                  </option>
                `
              )
            }

            // Populate time codes
            const timeCodeSelect = modalElement.querySelector(
              '#addTimesheetRow--timeCodeDataListItemId'
            ) as HTMLSelectElement

            timeCodeSelect.innerHTML = '<option value="">(None)</option>'

            for (const timeCode of optionsData.timeCodes) {
              timeCodeSelect.insertAdjacentHTML(
                'beforeend',
                /* html */ `
                  <option value="${cityssm.escapeHTML(timeCode.dataListItemId.toString())}">
                    ${cityssm.escapeHTML(timeCode.dataListItem)}
                  </option>
                `
              )
            }

            // Attach form submit handler with preprocessing
            modalElement
              .querySelector('form')
              ?.addEventListener('submit', doAddRow)
          },
          onshown(_modalElement, closeFunction) {
            bulmaJS.toggleHtmlClipped()
            closeModalFunction = closeFunction
          },

          onremoved() {
            bulmaJS.toggleHtmlClipped()
          }
        })
      }
    )
  }

  deleteColumn(column: TimesheetColumn): void {
    const columnTotal = this.getColumnTotal(column.timesheetColumnId)

    let message = 'Are you sure you want to delete this column?'

    if (columnTotal > 0) {
      message = `<strong>Warning:</strong> This column has <strong>${columnTotal} recorded hours</strong>. All associated hours will be permanently lost.<br><br>Are you sure you want to delete this column?`
    }

    bulmaJS.confirm({
      title: 'Delete Column',
      message,
      messageIsHtml: true,
      contextualColorName: 'danger',
      okButton: {
        text: 'Delete',

        callbackFunction: () => {
          const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`

          cityssm.postJSON(
            `${timesheetUrlPrefix}/doDeleteTimesheetColumn`,
            {
              timesheetColumnId: column.timesheetColumnId
            },
            (result: {
              success: boolean
              totalHours?: number
            }) => {
              if (result.success) {
                this.loadData()
                  .then(() => {
                    this.render()
                  })
                  .catch((error: unknown) => {
                    console.error('Error reloading data:', error)
                  })
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Column Deleted',

                  message: 'The column has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',

                  message: 'Failed to delete column'
                })
              }
            }
          )
        }
      }
    })
  }

  editColumn(column: TimesheetColumn): void {
    let closeModalFunction: () => void

    const doUpdateColumn = (submitEvent: Event): void => {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}/doUpdateTimesheetColumn`,
        editForm,
        (result: { success: boolean }) => {
          if (result.success) {
            closeModalFunction()
            this.loadData()
              .then(() => {
                this.render()
              })
              .catch((error: unknown) => {
                console.error('Error reloading data:', error)
              })
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Column Updated',

              message: 'The column has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Column',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('timesheets-editColumn', {
      onshow(modalElement) {
        // Set form values
        ;(
          modalElement.querySelector(
            '#editTimesheetColumn--timesheetColumnId'
          ) as HTMLInputElement
        ).value = column.timesheetColumnId.toString()
        ;(
          modalElement.querySelector(
            '#editTimesheetColumn--columnTitle'
          ) as HTMLInputElement
        ).value = column.columnTitle
        ;(
          modalElement.querySelector(
            '#editTimesheetColumn--workOrderNumber'
          ) as HTMLInputElement
        ).value = column.workOrderNumber ?? ''
        ;(
          modalElement.querySelector(
            '#editTimesheetColumn--costCenterA'
          ) as HTMLInputElement
        ).value = column.costCenterA ?? ''
        ;(
          modalElement.querySelector(
            '#editTimesheetColumn--costCenterB'
          ) as HTMLInputElement
        ).value = column.costCenterB ?? ''

        // Attach form submit handler
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateColumn)
      },
      onshown(_modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  async init(): Promise<void> {
    await this.loadData()
    this.render()
  }

  async loadData(): Promise<void> {
    const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`

    // eslint-disable-next-line promise/avoid-new
    await new Promise<void>((resolve, _reject) => {
      // Load columns
      cityssm.postJSON(
        `${timesheetUrlPrefix}/doGetTimesheetColumns`,
        { timesheetId: this.config.timesheetId },
        (columnsData: { columns: TimesheetColumn[] }) => {
          this.columns = columnsData.columns

          // Load rows
          cityssm.postJSON(
            `${timesheetUrlPrefix}/doGetTimesheetRows`,
            { timesheetId: this.config.timesheetId },
            (rowsData: { rows: TimesheetRow[] }) => {
              this.rows = rowsData.rows

              // Load cells
              cityssm.postJSON(
                `${timesheetUrlPrefix}/doGetTimesheetCells`,
                { timesheetId: this.config.timesheetId },
                (cellsData: {
                  cells: TimesheetCell[]
                }) => {
                  this.cells.clear()
                  for (const cell of cellsData.cells) {
                    const key = TimesheetGrid.getCellKey(
                      cell.timesheetRowId,
                      cell.timesheetColumnId
                    )
                    this.cells.set(key, cell)
                  }
                  resolve()
                }
              )
            }
          )
        }
      )
    })
  }

  moveColumn(column: TimesheetColumn, direction: 'left' | 'right'): void {
    // Find the current column and the adjacent one
    const currentIndex = this.columns.findIndex(
      (c) => c.timesheetColumnId === column.timesheetColumnId
    )

    if (currentIndex === -1) {
      return
    }

    let targetIndex: number
    if (direction === 'left') {
      targetIndex = currentIndex - 1
      if (targetIndex < 0) {
        return
      }
    } else {
      targetIndex = currentIndex + 1
      if (targetIndex >= this.columns.length) {
        return
      }
    }

    // Swap the columns in the array
    const newColumns = [...this.columns]
    const temp = newColumns[currentIndex]
    newColumns[currentIndex] = newColumns[targetIndex]
    newColumns[targetIndex] = temp

    // Build the new order array
    const timesheetColumnIds = newColumns.map((c) => c.timesheetColumnId)

    // Send the reorder request
    const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`

    cityssm.postJSON(
      `${timesheetUrlPrefix}/doReorderTimesheetColumns`,
      {
        timesheetId: this.config.timesheetId,
        timesheetColumnIds
      },
      (result: { success: boolean }) => {
        if (result.success) {
          this.loadData()
            .then(() => {
              this.render()
            })
            .catch((error: unknown) => {
              console.error('Error reloading data:', error)
            })
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error',

            message: 'Failed to reorder columns'
          })
        }
      }
    )
  }

  render(): void {
    const visibleColumns = this.columns.filter((col) =>
      this.shouldShowColumn(col)
    )
    const visibleRows = this.rows.filter((row) => this.shouldShowRow(row))

    // Create table
    const table = document.createElement('table')
    table.className =
      'table is-bordered is-striped is-hoverable is-fullwidth has-sticky-header timesheet-grid'

    // Create header
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')

    // First column is for row labels
    const thCorner = document.createElement('th')
    thCorner.style.minWidth = '200px'

    const cornerTitle = document.createElement('div')
    cornerTitle.textContent = 'Employee / Equipment'
    thCorner.append(cornerTitle)

    if (this.config.isEditable) {
      const addRowButton = document.createElement('button')

      addRowButton.className = 'button is-primary is-small mt-2'
      addRowButton.title = 'Add Row'

      addRowButton.innerHTML =
        '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span><span>Add</span>'

      addRowButton.addEventListener('click', () => {
        // Trigger the add row button in the toolbar
        const addRowToolbarButton = document.querySelector(
          '#button--addRow'
        ) as HTMLAnchorElement | null

        if (addRowToolbarButton !== null) {
          addRowToolbarButton.click()
        }
      })
      thCorner.append(addRowButton)
    }

    headerRow.append(thCorner)

    // Column headers
    for (let colIndex = 0; colIndex < visibleColumns.length; colIndex += 1) {
      const column = visibleColumns[colIndex]

      const th = document.createElement('th')
      th.dataset.columnId = column.timesheetColumnId.toString()
      th.textContent = column.columnTitle
      th.style.minWidth = '100px'
      th.style.textAlign = 'center'

      const columnTotal = this.getColumnTotal(column.timesheetColumnId)
      if (columnTotal === 0) {
        th.classList.add('has-background-warning-light')
      }

      if (column.workOrderNumber) {
        const small = document.createElement('small')
        small.className = 'is-block has-text-grey'
        small.textContent = `WO: ${column.workOrderNumber}`
        th.append(document.createElement('br'), small)
      }

      if (this.config.isEditable) {
        const columnActions = document.createElement('div')
        columnActions.className = 'buttons are-small is-centered mt-2'

        // Move left button (only if not first column)
        if (colIndex > 0) {
          const moveLeftButton = document.createElement('button')
          moveLeftButton.className = 'button is-light is-small'
          moveLeftButton.innerHTML =
            '<span class="icon is-small"><i class="fa-solid fa-arrow-left"></i></span>'
          moveLeftButton.title = 'Move Left'
          moveLeftButton.addEventListener('click', () => {
            this.moveColumn(column, 'left')
          })
          columnActions.append(moveLeftButton)
        }

        // Move right button (only if not last column)
        if (colIndex < visibleColumns.length - 1) {
          const moveRightButton = document.createElement('button')
          moveRightButton.className = 'button is-light is-small'
          moveRightButton.innerHTML =
            '<span class="icon is-small"><i class="fa-solid fa-arrow-right"></i></span>'
          moveRightButton.title = 'Move Right'
          moveRightButton.addEventListener('click', () => {
            this.moveColumn(column, 'right')
          })
          columnActions.append(moveRightButton)
        }

        const editButton = document.createElement('button')
        editButton.className = 'button is-info is-small'
        editButton.innerHTML =
          '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>'
        editButton.title = 'Edit Column'
        editButton.addEventListener('click', () => {
          this.editColumn(column)
        })

        const deleteButton = document.createElement('button')
        deleteButton.className = 'button is-danger is-small'
        deleteButton.innerHTML =
          '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>'
        deleteButton.title = 'Delete Column'
        deleteButton.addEventListener('click', () => {
          this.deleteColumn(column)
        })

        columnActions.append(editButton, deleteButton)
        th.append(columnActions)
      }

      headerRow.append(th)
    }

    // Add column header (before Total Hours)
    if (this.config.isEditable) {
      const thAddColumn = document.createElement('th')
      thAddColumn.style.width = '80px'
      thAddColumn.style.textAlign = 'center'

      const addColumnButton = document.createElement('button')
      addColumnButton.className = 'button is-primary is-small'
      addColumnButton.innerHTML =
        '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span><span>Add</span>'
      addColumnButton.title = 'Add Column'
      addColumnButton.addEventListener('click', () => {
        // Trigger the add column button in the toolbar
        const addColumnToolbarButton = document.querySelector(
          '#button--addColumn'
        ) as HTMLAnchorElement | null
        if (addColumnToolbarButton !== null) {
          addColumnToolbarButton.click()
        }
      })

      thAddColumn.append(addColumnButton)
      headerRow.append(thAddColumn)
    }

    // Total column
    const thTotal = document.createElement('th')
    thTotal.textContent = 'Total Hours'
    thTotal.style.textAlign = 'center'
    thTotal.style.fontWeight = 'bold'
    headerRow.append(thTotal)

    thead.append(headerRow)
    table.append(thead)

    // Create body
    const tbody = document.createElement('tbody')

    for (const row of visibleRows) {
      const tr = document.createElement('tr')

      // Row label
      const tdLabel = document.createElement('td')
      tdLabel.className = 'timesheet-row-label'

      const rowTitle = document.createElement('strong')
      rowTitle.textContent = row.rowTitle
      tdLabel.append(rowTitle)

      if (row.employeeNumber) {
        const employeeInfo = document.createElement('small')
        employeeInfo.className = 'is-block has-text-grey'
        employeeInfo.textContent = `Employee: ${row.employeeNumber}`
        tdLabel.append(document.createElement('br'), employeeInfo)
      }

      if (row.equipmentNumber) {
        const equipmentInfo = document.createElement('small')
        equipmentInfo.className = 'is-block has-text-grey'
        equipmentInfo.textContent = `Equipment: ${row.equipmentNumber}`
        tdLabel.append(document.createElement('br'), equipmentInfo)
      }

      if (this.config.isEditable) {
        const rowActions = document.createElement('div')
        rowActions.className = 'buttons are-small mt-2'

        const editButton = document.createElement('button')
        editButton.className = 'button is-info is-small'
        editButton.innerHTML =
          '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>'
        editButton.title = 'Edit Row'
        editButton.addEventListener('click', () => {
          this.editRow(row)
        })

        const deleteButton = document.createElement('button')
        deleteButton.className = 'button is-danger is-small'
        deleteButton.innerHTML =
          '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>'
        deleteButton.title = 'Delete Row'
        deleteButton.addEventListener('click', () => {
          this.deleteRow(row)
        })

        rowActions.append(editButton, deleteButton)
        tdLabel.append(rowActions)
      }

      tr.append(tdLabel)

      // Create cells for each column
      for (const column of visibleColumns) {
        const td = this.createCellElement(row, column)
        tr.append(td)
      }

      // Empty cell for the add column header (if editable)
      if (this.config.isEditable) {
        const tdEmpty = document.createElement('td')
        tdEmpty.className = 'has-background-light'
        tr.append(tdEmpty)
      }

      // Total cell
      const tdTotal = document.createElement('td')
      tdTotal.dataset.rowTotal = row.timesheetRowId.toString()
      const rowTotal = this.getRowTotal(row.timesheetRowId)
      tdTotal.textContent = rowTotal.toString()
      tdTotal.style.textAlign = 'right'
      tdTotal.style.fontWeight = 'bold'

      if (rowTotal === 0) {
        tdTotal.classList.add('has-background-warning-light')
      }

      tr.append(tdTotal)
      tbody.append(tr)
    }

    table.append(tbody)

    // Clear container and add table
    this.containerElement.innerHTML = ''
    this.containerElement.append(table)
  }

  setDisplayOptions(options: {
    hideEmptyRows?: boolean
    hideEmptyColumns?: boolean
    filterRows?: string
  }): void {
    if (options.hideEmptyRows !== undefined) {
      this.config.hideEmptyRows = options.hideEmptyRows
    }
    if (options.hideEmptyColumns !== undefined) {
      this.config.hideEmptyColumns = options.hideEmptyColumns
    }
    if (options.filterRows !== undefined) {
      this.config.filterRows = options.filterRows
    }
    this.render()
  }

  private createCellElement(
    row: TimesheetRow,
    column: TimesheetColumn
  ): HTMLTableCellElement {
    const td = document.createElement('td')
    td.className = 'timesheet-cell'
    td.style.textAlign = 'right'

    const hours = this.getCellHours(
      row.timesheetRowId,
      column.timesheetColumnId
    )

    if (this.config.isEditable) {
      const input = document.createElement('input')
      input.type = 'number'
      input.className = 'input is-small'
      input.step = '0.25'
      input.min = '0'
      input.value = hours > 0 ? hours.toString() : ''
      input.placeholder = '0'
      input.style.width = '80px'
      input.style.textAlign = 'right'

      input.addEventListener('change', () => {
        const newHours = input.value === '' ? 0 : Number.parseFloat(input.value)
        this.updateCell(row.timesheetRowId, column.timesheetColumnId, newHours)
      })

      td.append(input)
    } else {
      td.textContent = hours > 0 ? hours.toString() : ''
    }

    return td
  }

  private deleteRow(row: TimesheetRow): void {
    const rowTotal = this.getRowTotal(row.timesheetRowId)

    let message = 'Are you sure you want to delete this row?'

    if (rowTotal > 0) {
      message = `<strong>Warning:</strong> This row has <strong>${rowTotal} recorded hours</strong>. All associated hours will be permanently lost.<br><br>Are you sure you want to delete this row?`
    }

    bulmaJS.confirm({
      contextualColorName: 'danger',
      title: 'Delete Row',

      message,
      messageIsHtml: true,
      okButton: {
        text: 'Delete',

        callbackFunction: () => {
          const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`

          cityssm.postJSON(
            `${timesheetUrlPrefix}/doDeleteTimesheetRow`,
            {
              timesheetRowId: row.timesheetRowId
            },
            (result: { success: boolean }) => {
              if (result.success) {
                this.loadData()
                  .then(() => {
                    this.render()
                  })
                  .catch((error: unknown) => {
                    console.error('Error reloading data:', error)
                  })
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Row Deleted',

                  message: 'The row has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',

                  message: 'Failed to delete row'
                })
              }
            }
          )
        }
      }
    })
  }

  private editRow(row: TimesheetRow): void {
    let closeModalFunction: () => void

    const doUpdateRow = (submitEvent: Event): void => {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement
      const formData = new FormData(editForm)

      // Convert empty strings to null for foreign key fields
      const requestData: Record<string, string | null> = {}
      for (const [key, value] of formData.entries()) {
        const stringValue = value.toString()

        if (
          key === 'jobClassificationDataListItemId' ||
          key === 'timeCodeDataListItemId'
        ) {
          requestData[key] = stringValue === '' ? null : stringValue
        } else {
          requestData[key] = stringValue === '' ? null : stringValue
        }
      }

      cityssm.postJSON(
        `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}/doUpdateTimesheetRow`,
        requestData,
        (result: { success: boolean }) => {
          if (result.success) {
            closeModalFunction()
            this.loadData()
              .then(() => {
                this.render()
              })
              .catch((error: unknown) => {
                console.error('Error reloading data:', error)
              })
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Row Updated',

              message: 'The row has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Row',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    // Load options for the modal
    cityssm.postJSON(
      `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}/doGetTimesheetRowOptions`,
      {},
      (optionsData: {
        success: boolean

        jobClassifications: Array<{
          dataListItem: string
          dataListItemId: number
        }>
        timeCodes: Array<{ dataListItem: string; dataListItemId: number }>
      }) => {
        if (!optionsData.success) {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error',

            message: 'Failed to load row options.'
          })
          return
        }

        cityssm.openHtmlModal('timesheets-editRow', {
          onshow(modalElement) {
            // Set form values
            ;(
              modalElement.querySelector(
                '#editTimesheetRow--timesheetRowId'
              ) as HTMLInputElement
            ).value = row.timesheetRowId.toString()
            ;(
              modalElement.querySelector(
                '#editTimesheetRow--rowTitle'
              ) as HTMLInputElement
            ).value = row.rowTitle

            // Display employee (read-only)
            const employeeDisplay = modalElement.querySelector(
              '#editTimesheetRow--employeeDisplay'
            ) as HTMLInputElement

            employeeDisplay.value =
              row.employeeNumber !== undefined && row.employeeNumber !== null
                ? `${row.employeeLastName ?? ''}, ${row.employeeFirstName ?? ''} (${row.employeeNumber})`
                : '(None)'

            // Display equipment (read-only)
            const equipmentDisplay = modalElement.querySelector(
              '#editTimesheetRow--equipmentDisplay'
            ) as HTMLInputElement

            equipmentDisplay.value =
              row.equipmentNumber !== undefined && row.equipmentNumber !== null
                ? `${row.equipmentName ?? ''} (${row.equipmentNumber})`
                : '(None)'

            // Populate job classifications
            const jobClassSelect = modalElement.querySelector(
              '#editTimesheetRow--jobClassificationDataListItemId'
            ) as HTMLSelectElement
            jobClassSelect.innerHTML = '<option value="">(None)</option>'
            for (const jobClass of optionsData.jobClassifications) {
              const selected =
                row.jobClassificationDataListItemId === jobClass.dataListItemId

              // eslint-disable-next-line no-unsanitized/method
              jobClassSelect.insertAdjacentHTML(
                'beforeend',
                /* html */ `
                  <option value="${cityssm.escapeHTML(jobClass.dataListItemId.toString())}"
                    ${selected ? ' selected' : ''}
                  >
                    ${cityssm.escapeHTML(jobClass.dataListItem)}
                  </option>
                `
              )
            }

            // Populate time codes
            const timeCodeSelect = modalElement.querySelector(
              '#editTimesheetRow--timeCodeDataListItemId'
            ) as HTMLSelectElement
            timeCodeSelect.innerHTML = '<option value="">(None)</option>'
            for (const timeCode of optionsData.timeCodes) {
              const selected =
                row.timeCodeDataListItemId === timeCode.dataListItemId

              // eslint-disable-next-line no-unsanitized/method
              timeCodeSelect.insertAdjacentHTML(
                'beforeend',
                /* html */ `
                  <option value="${cityssm.escapeHTML(timeCode.dataListItemId.toString())}"
                    ${selected ? ' selected' : ''}
                  >
                    ${cityssm.escapeHTML(timeCode.dataListItem)}
                  </option>
                `
              )
            }

            // Attach form submit handler
            modalElement
              .querySelector('form')
              ?.addEventListener('submit', doUpdateRow)
          },
          onshown(_modalElement, closeFunction) {
            bulmaJS.toggleHtmlClipped()
            closeModalFunction = closeFunction
          },

          onremoved() {
            bulmaJS.toggleHtmlClipped()
          }
        })
      }
    )
  }

  private getCellHours(rowId: number, columnId: number): number {
    const key = TimesheetGrid.getCellKey(rowId, columnId)
    return this.cells.get(key)?.recordHours ?? 0
  }

  private getColumnTotal(columnId: number): number {
    let total = 0
    for (const row of this.rows) {
      total += this.getCellHours(row.timesheetRowId, columnId)
    }
    return total
  }

  private getRowTotal(rowId: number): number {
    let total = 0
    for (const column of this.columns) {
      total += this.getCellHours(rowId, column.timesheetColumnId)
    }
    return total
  }

  private setCellHours(rowId: number, columnId: number, hours: number): void {
    const key = TimesheetGrid.getCellKey(rowId, columnId)
    if (hours === 0) {
      this.cells.delete(key)
    } else {
      this.cells.set(key, {
        timesheetRowId: rowId,
        timesheetColumnId: columnId,
        recordHours: hours,
        mappingConfidence: 0
      })
    }
  }

  private shouldShowColumn(column: TimesheetColumn): boolean {
    if (!this.config.hideEmptyColumns) {
      return true
    }
    return this.getColumnTotal(column.timesheetColumnId) > 0
  }

  private shouldShowRow(row: TimesheetRow): boolean {
    // Check filter first
    if (this.config.filterRows !== '') {
      const filterLower = this.config.filterRows.toLowerCase()
      const rowTitleLower = row.rowTitle.toLowerCase()
      const employeeName =
        row.employeeFirstName !== undefined &&
        row.employeeLastName !== undefined
          ? `${row.employeeLastName}, ${row.employeeFirstName}`.toLowerCase()
          : ''
      const equipmentName = row.equipmentName?.toLowerCase() ?? ''

      const matchesFilter =
        rowTitleLower.includes(filterLower) ||
        employeeName.includes(filterLower) ||
        equipmentName.includes(filterLower)

      if (!matchesFilter) {
        return false
      }
    }

    // Check empty rows
    if (!this.config.hideEmptyRows) {
      return true
    }
    return this.getRowTotal(row.timesheetRowId) > 0
  }

  private updateCell(rowId: number, columnId: number, hours: number): void {
    const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`

    cityssm.postJSON(
      `${timesheetUrlPrefix}/doUpdateTimesheetCell`,
      {
        timesheetRowId: rowId,
        timesheetColumnId: columnId,
        recordHours: hours
      },
      (result: { success: boolean }) => {
        if (result.success) {
          this.setCellHours(rowId, columnId, hours)
          this.updateTotals()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error',

            message: 'Failed to update cell'
          })
        }
      }
    )
  }

  private updateTotals(): void {
    // Update column totals
    for (const column of this.columns) {
      const columnTotal = this.getColumnTotal(column.timesheetColumnId)
      const columnHeader = document.querySelector(
        `th[data-column-id="${column.timesheetColumnId}"]`
      ) as HTMLElement | null

      if (columnHeader !== null) {
        columnHeader.classList.toggle(
          'has-background-warning-light',
          columnTotal === 0
        )
      }
    }

    // Update row totals
    for (const row of this.rows) {
      const rowTotal = this.getRowTotal(row.timesheetRowId)
      const totalCell = document.querySelector(
        `td[data-row-total="${row.timesheetRowId}"]`
      ) as HTMLElement | null

      if (totalCell !== null) {
        totalCell.textContent = rowTotal.toString()

        totalCell.classList.toggle(
          'has-background-warning-light',
          rowTotal === 0
        )
      }
    }
  }
}

// Add to exports for use in other scripts
exports.TimesheetGrid = TimesheetGrid
