import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Shift } from '../../types/record.types.js'

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
    filterRows: string
  }) => {
    init: () => Promise<void>
    setDisplayOptions: (options: { hideEmptyRows?: boolean; hideEmptyColumns?: boolean; filterRows?: string }) => void
    addColumn: () => void
    addRow: () => void
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
      (response: {
        success: boolean
        shifts?: Shift[]
      }) => {
        if (response.success && response.shifts !== undefined) {
          // Check if we have a temporarily stored shift ID (from initial page load)
          const tempShiftId = shiftIdElement.dataset.tempShiftId
          const currentShiftId = tempShiftId ?? shiftIdElement.value

          // Rebuild shift dropdown
          shiftIdElement.innerHTML = '<option value="">(No Shift)</option>'

          for (const shift of response.shifts) {
            const optionElement = document.createElement('option')
            optionElement.value = shift.shiftId.toString()
            optionElement.textContent = `Shift #${shift.shiftId} - ${shift.shiftTimeDataListItem ?? ''} (${shift.shiftTypeDataListItem ?? ''})`
            
            if (shift.shiftId.toString() === currentShiftId) {
              optionElement.selected = true
            }

            shiftIdElement.append(optionElement)
          }
          
          // Clear the temporary attribute after first load
          if (tempShiftId !== null) {
            delete shiftIdElement.dataset.tempShiftId
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
    const initialShiftId = shiftIdElement?.dataset.initialValue ?? ''
    
    // Store it temporarily
    if (shiftIdElement !== null && initialShiftId !== '') {
      shiftIdElement.dataset.tempShiftId = initialShiftId
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
      (result: {
        success: boolean
        timesheetId?: number
      }) => {
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
        hideEmptyColumns: false,
        filterRows: ''
      })

      // Display options
      const hideEmptyRowsCheckbox = document.querySelector('#display--hideEmptyRows') as HTMLInputElement | null
      const hideEmptyColumnsCheckbox = document.querySelector('#display--hideEmptyColumns') as HTMLInputElement | null
      const filterRowsInput = document.querySelector('#display--filterRows') as HTMLInputElement | null

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

      if (filterRowsInput !== null) {
        filterRowsInput.addEventListener('input', () => {
          grid.setDisplayOptions({ filterRows: filterRowsInput.value })
        })
      }

      // Initialize grid
      grid.init().catch((error: unknown) => {
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
          grid.addColumn()
        })
      }

      // Add row button
      const addRowButton = document.querySelector('#button--addRow') as HTMLAnchorElement | null
      if (addRowButton !== null) {
        addRowButton.addEventListener('click', (event) => {
          event.preventDefault()
          dropdownElement?.classList.remove('is-active')
          grid.addRow()
        })
      }

      // Copy from shift button
      const copyFromShiftButton = document.querySelector('#button--copyFromShift') as HTMLAnchorElement | null
      if (copyFromShiftButton !== null) {
        copyFromShiftButton.addEventListener('click', (event) => {
          event.preventDefault()
          dropdownElement?.classList.remove('is-active')
          openCopyFromShiftModal()
        })
      }

      // Copy from previous timesheet button
      const copyFromPreviousButton = document.querySelector('#button--copyFromPrevious') as HTMLAnchorElement | null
      if (copyFromPreviousButton !== null) {
        copyFromPreviousButton.addEventListener('click', (event) => {
          event.preventDefault()
          dropdownElement?.classList.remove('is-active')
          openCopyFromPreviousTimesheetModal()
        })
      }

      /*
       * Copy from Shift Modal
       */
      function openCopyFromShiftModal(): void {
        let closeModalFunction: () => void

        cityssm.openHtmlModal('timesheets-copyFromShift', {
          onshow(modalElement) {
            const timesheetId = timesheetIdElement.value
            ;(modalElement.querySelector('#copyFromShift--timesheetId') as HTMLInputElement).value = timesheetId

            const submitButton = modalElement.querySelector('#button--copyFromShift') as HTMLButtonElement
            const listContainer = modalElement.querySelector('#list--shifts') as HTMLElement
            const loadingNotice = modalElement.querySelector('#notice--loading') as HTMLElement
            const noShiftsNotice = modalElement.querySelector('#notice--noShifts') as HTMLElement

            let selectedShiftId: number | null = null

            // Load available shifts
            const supervisorEmployeeNumber = supervisorElement?.value ?? ''
            const shiftDateString = timesheetDateElement?.value ?? ''

            cityssm.postJSON(
              `${urlPrefix}/doGetAvailableShifts`,
              {
                supervisorEmployeeNumber,
                shiftDateString
              },
              (response: {
                success: boolean
                shifts?: Shift[]
              }) => {
                loadingNotice.classList.add('is-hidden')

                if (response.success && response.shifts !== undefined && response.shifts.length > 0) {
                  listContainer.classList.remove('is-hidden')

                  for (const shift of response.shifts) {
                    const shiftElement = document.createElement('div')
                    shiftElement.className = 'box is-clickable mb-2'
                    shiftElement.dataset.shiftId = shift.shiftId.toString()
                    
                    shiftElement.innerHTML = `
                      <div class="columns is-mobile is-vcentered">
                        <div class="column">
                          <strong>Shift #${cityssm.escapeHTML(shift.shiftId.toString())}</strong><br />
                          <span class="is-size-7">
                            ${cityssm.escapeHTML(shift.shiftTypeDataListItem ?? '')}<br />
                            ${cityssm.escapeHTML(shift.shiftTimeDataListItem ?? '')}<br />
                            Employees: ${shift.employeesCount ?? 0}, Equipment: ${shift.equipmentCount ?? 0}
                          </span>
                        </div>
                        <div class="column is-narrow">
                          <span class="icon is-hidden" data-shift-check>
                            <i class="fa-solid fa-check has-text-success"></i>
                          </span>
                        </div>
                      </div>
                    `

                    shiftElement.addEventListener('click', () => {
                      // Deselect all
                      listContainer.querySelectorAll('.box').forEach((box) => {
                        box.classList.remove('has-background-success-light')
                        ;(box.querySelector('[data-shift-check]') as HTMLElement)?.classList.add('is-hidden')
                      })

                      // Select this one
                      shiftElement.classList.add('has-background-success-light')
                      ;(shiftElement.querySelector('[data-shift-check]') as HTMLElement)?.classList.remove('is-hidden')
                      selectedShiftId = shift.shiftId
                      submitButton.disabled = false
                    })

                    listContainer.append(shiftElement)
                  }
                } else {
                  noShiftsNotice.classList.remove('is-hidden')
                }
              }
            )

            // Handle form submission
            modalElement.querySelector('#form--copyFromShift')?.addEventListener('submit', (formEvent) => {
              formEvent.preventDefault()

              if (selectedShiftId === null) {
                return
              }

              submitButton.disabled = true

              cityssm.postJSON(
                `${urlPrefix}/doCopyFromShift`,
                {
                  shiftId: selectedShiftId,
                  timesheetId
                },
                (response: {
                  success: boolean
                }) => {
                  if (response.success) {
                    closeModalFunction()
                    bulmaJS.alert({
                      contextualColorName: 'success',
                      message: 'Successfully copied data from shift.'
                    })
                    // Refresh the grid
                    grid.init().catch((error: unknown) => {
                      console.error('Error reinitializing grid:', error)
                    })
                  } else {
                    bulmaJS.alert({
                      contextualColorName: 'danger',
                      message: 'An error occurred while copying from shift.'
                    })
                    submitButton.disabled = false
                  }
                }
              )
            })
          },
          onshown(_modalElement, closeFunction) {
            closeModalFunction = closeFunction
          }
        })
      }

      /*
       * Copy from Previous Timesheet Modal
       */
      function openCopyFromPreviousTimesheetModal(): void {
        let closeModalFunction: () => void

        cityssm.openHtmlModal('timesheets-copyFromPreviousTimesheet', {
          onshow(modalElement) {
            const timesheetId = timesheetIdElement.value
            const timesheetTypeDataListItemId = (formElement.querySelector('#timesheet--timesheetTypeDataListItemId') as HTMLSelectElement)?.value ?? ''
            const supervisorEmployeeNumber = supervisorElement?.value ?? ''

            ;(modalElement.querySelector('#copyFromPreviousTimesheet--targetTimesheetId') as HTMLInputElement).value = timesheetId
            ;(modalElement.querySelector('#searchTimesheets--currentTimesheetId') as HTMLInputElement).value = timesheetId

            const submitButton = modalElement.querySelector('#button--copyFromPreviousTimesheet') as HTMLButtonElement
            const listContainer = modalElement.querySelector('#list--timesheets') as HTMLElement
            const searchResultsContainer = modalElement.querySelector('#container--searchResults') as HTMLElement
            const noTimesheetsNotice = modalElement.querySelector('#notice--noTimesheets') as HTMLElement

            // Populate timesheet type dropdown
            const timesheetTypeSelect = modalElement.querySelector('#searchTimesheets--timesheetTypeDataListItemId') as HTMLSelectElement
            const originalTimesheetTypeSelect = formElement.querySelector('#timesheet--timesheetTypeDataListItemId') as HTMLSelectElement
            if (originalTimesheetTypeSelect !== null) {
              Array.from(originalTimesheetTypeSelect.options).forEach((option) => {
                if (option.value !== '') {
                  const newOption = document.createElement('option')
                  newOption.value = option.value
                  newOption.textContent = option.textContent
                  if (option.value === timesheetTypeDataListItemId) {
                    newOption.selected = true
                  }
                  timesheetTypeSelect.append(newOption)
                }
              })
            }

            // Populate supervisor dropdown
            const supervisorSelect = modalElement.querySelector('#searchTimesheets--supervisorEmployeeNumber') as HTMLSelectElement
            const originalSupervisorSelect = formElement.querySelector('#timesheet--supervisorEmployeeNumber') as HTMLSelectElement
            if (originalSupervisorSelect !== null) {
              Array.from(originalSupervisorSelect.options).forEach((option) => {
                if (option.value !== '') {
                  const newOption = document.createElement('option')
                  newOption.value = option.value
                  newOption.textContent = option.textContent
                  if (option.value === supervisorEmployeeNumber) {
                    newOption.selected = true
                  }
                  supervisorSelect.append(newOption)
                }
              })
            }

            let selectedTimesheetId: number | null = null

            // Search form submission
            modalElement.querySelector('#form--searchTimesheets')?.addEventListener('submit', (formEvent) => {
              formEvent.preventDefault()

              const searchForm = formEvent.currentTarget as HTMLFormElement
              const searchData = new FormData(searchForm)

              // Clear previous results
              listContainer.innerHTML = ''
              selectedTimesheetId = null
              submitButton.disabled = true

              cityssm.postJSON(
                `${urlPrefix}/doSearchTimesheets`,
                {
                  timesheetTypeDataListItemId: searchData.get('timesheetTypeDataListItemId') ?? '',
                  supervisorEmployeeNumber: searchData.get('supervisorEmployeeNumber') ?? '',
                  limit: 20,
                  offset: 0
                },
                (response: {
                  success: boolean
                  timesheets?: Array<{
                    timesheetId: number
                    timesheetDate: string
                    timesheetTypeDataListItem?: string
                    supervisorFirstName?: string
                    supervisorLastName?: string
                    timesheetTitle?: string
                  }>
                }) => {
                  searchResultsContainer.classList.remove('is-hidden')

                  if (response.success && response.timesheets !== undefined && response.timesheets.length > 0) {
                    // Filter out the current timesheet
                    const filteredTimesheets = response.timesheets.filter(
                      (t) => t.timesheetId.toString() !== timesheetId
                    )

                    if (filteredTimesheets.length === 0) {
                      noTimesheetsNotice.classList.remove('is-hidden')
                      return
                    }

                    noTimesheetsNotice.classList.add('is-hidden')

                    for (const timesheet of filteredTimesheets) {
                      const timesheetElement = document.createElement('div')
                      timesheetElement.className = 'box is-clickable mb-2'
                      timesheetElement.dataset.timesheetId = timesheet.timesheetId.toString()
                      
                      const dateString = new Date(timesheet.timesheetDate).toLocaleDateString()
                      const supervisorLastName = timesheet.supervisorLastName ?? ''
                      const supervisorFirstName = timesheet.supervisorFirstName ?? ''
                      const supervisorName = supervisorLastName && supervisorFirstName 
                        ? `${supervisorLastName}, ${supervisorFirstName}` 
                        : supervisorLastName || supervisorFirstName || '(Unknown)'
                      
                      timesheetElement.innerHTML = `
                        <div class="columns is-mobile is-vcentered">
                          <div class="column">
                            <strong>Timesheet #${cityssm.escapeHTML(timesheet.timesheetId.toString())}</strong><br />
                            <span class="is-size-7">
                              ${cityssm.escapeHTML(timesheet.timesheetTypeDataListItem ?? '')}<br />
                              ${cityssm.escapeHTML(dateString)}<br />
                              Supervisor: ${cityssm.escapeHTML(supervisorName)}<br />
                              ${timesheet.timesheetTitle ? cityssm.escapeHTML(timesheet.timesheetTitle) : ''}
                            </span>
                          </div>
                          <div class="column is-narrow">
                            <span class="icon is-hidden" data-timesheet-check>
                              <i class="fa-solid fa-check has-text-success"></i>
                            </span>
                          </div>
                        </div>
                      `

                      timesheetElement.addEventListener('click', () => {
                        // Deselect all
                        listContainer.querySelectorAll('.box').forEach((box) => {
                          box.classList.remove('has-background-success-light')
                          ;(box.querySelector('[data-timesheet-check]') as HTMLElement)?.classList.add('is-hidden')
                        })

                        // Select this one
                        timesheetElement.classList.add('has-background-success-light')
                        ;(timesheetElement.querySelector('[data-timesheet-check]') as HTMLElement)?.classList.remove('is-hidden')
                        selectedTimesheetId = timesheet.timesheetId
                        ;(modalElement.querySelector('#copyFromPreviousTimesheet--sourceTimesheetId') as HTMLInputElement).value = timesheet.timesheetId.toString()
                        submitButton.disabled = false
                      })

                      listContainer.append(timesheetElement)
                    }
                  } else {
                    noTimesheetsNotice.classList.remove('is-hidden')
                  }
                }
              )
            })

            // Handle copy form submission
            modalElement.querySelector('#form--copyFromPreviousTimesheet')?.addEventListener('submit', (formEvent) => {
              formEvent.preventDefault()

              if (selectedTimesheetId === null) {
                return
              }

              submitButton.disabled = true

              cityssm.postJSON(
                `${urlPrefix}/doCopyFromPreviousTimesheet`,
                {
                  sourceTimesheetId: selectedTimesheetId,
                  targetTimesheetId: timesheetId
                },
                (response: {
                  success: boolean
                }) => {
                  if (response.success) {
                    closeModalFunction()
                    bulmaJS.alert({
                      contextualColorName: 'success',
                      message: 'Successfully copied data from previous timesheet.'
                    })
                    // Refresh the grid
                    grid.init().catch((error: unknown) => {
                      console.error('Error reinitializing grid:', error)
                    })
                  } else {
                    bulmaJS.alert({
                      contextualColorName: 'danger',
                      message: 'An error occurred while copying from previous timesheet.'
                    })
                    submitButton.disabled = false
                  }
                }
              )
            })
          },
          onshown(_modalElement, closeFunction) {
            closeModalFunction = closeFunction
          }
        })
      }
    }
  }
})()
