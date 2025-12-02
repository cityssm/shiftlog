import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Employee, UserGroup } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  employees: Employee[]
  shiftLog: ShiftLogGlobal
  userGroups: UserGroup[]
}
;(() => {
  const shiftLog = exports.shiftLog

  const employeesContainerElement = document.querySelector(
    '#container--employees'
  ) as HTMLElement

  // Pagination settings
  const ITEMS_PER_PAGE = 10
  let currentPage = 1
  let currentFilteredEmployees: Employee[] = exports.employees

  function pageSelect(pageNumber: number): void {
    currentPage = pageNumber
    renderEmployeesWithPagination(currentFilteredEmployees)
  }

  function deleteEmployee(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const employeeNumber = buttonElement.dataset.employeeNumber

    if (employeeNumber === undefined) {
      return
    }

    const employee = exports.employees.find(
      (possibleEmployee) => possibleEmployee.employeeNumber === employeeNumber
    )

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Employee',

      message: `Are you sure you want to delete employee "${employee?.firstName ?? ''} ${employee?.lastName ?? ''}" (${employeeNumber})? This action cannot be undone.`,

      okButton: {
        contextualColorName: 'warning',
        text: 'Delete Employee',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteEmployee`,
            {
              employeeNumber
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                message?: string
                success: boolean

                employees?: Employee[]
              }

              if (responseJSON.success) {
                // Update the employees list with the new data from the server
                if (responseJSON.employees !== undefined) {
                  exports.employees = responseJSON.employees
                  currentFilteredEmployees = responseJSON.employees
                  currentPage = 1
                  renderEmployeesWithPagination(responseJSON.employees)
                }

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Employee Deleted',

                  message: 'Employee has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Employee',

                  message: responseJSON.message ?? 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function editEmployee(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const employeeNumber = buttonElement.dataset.employeeNumber

    if (employeeNumber === undefined) {
      return
    }

    // Find the employee in the current employees list
    const employee = exports.employees.find(
      (employee) => employee.employeeNumber === employeeNumber
    )

    if (employee === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateEmployee(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateEmployee`,
        editForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            message?: string
            success: boolean
            employees?: Employee[]
          }

          if (responseJSON.success) {
            closeModalFunction()

            // Update the employees list with the new data from the server
            if (responseJSON.employees !== undefined) {
              exports.employees = responseJSON.employees
              currentFilteredEmployees = responseJSON.employees
              currentPage = 1
              renderEmployeesWithPagination(responseJSON.employees)
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Employee Updated',

              message: 'Employee has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Employee',

              message: responseJSON.message ?? 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminEmployees-edit', {
      onshow(modalElement) {
        // Set employeeNumber field
        ;(
          modalElement.querySelector(
            '#editEmployee--employeeNumber'
          ) as HTMLInputElement
        ).value = employeeNumber

        // Pre-populate fields
        ;(
          modalElement.querySelector(
            '#editEmployee--firstName'
          ) as HTMLInputElement
        ).value = employee.firstName
        ;(
          modalElement.querySelector(
            '#editEmployee--lastName'
          ) as HTMLInputElement
        ).value = employee.lastName
        ;(
          modalElement.querySelector(
            '#editEmployee--userName'
          ) as HTMLInputElement
        ).value = employee.userName ?? ''
        ;(
          modalElement.querySelector(
            '#editEmployee--isSupervisor'
          ) as HTMLInputElement
        ).checked = employee.isSupervisor
        ;(
          modalElement.querySelector(
            '#editEmployee--recordSync_isSynced'
          ) as HTMLInputElement
        ).checked = employee.recordSync_isSynced
        ;(
          modalElement.querySelector(
            '#editEmployee--phoneNumber'
          ) as HTMLInputElement
        ).value = employee.phoneNumber ?? ''
        ;(
          modalElement.querySelector(
            '#editEmployee--phoneNumberAlternate'
          ) as HTMLInputElement
        ).value = employee.phoneNumberAlternate ?? ''
        ;(
          modalElement.querySelector(
            '#editEmployee--emailAddress'
          ) as HTMLInputElement
        ).value = employee.emailAddress ?? ''

        // Populate user groups dropdown
        const userGroupSelect = modalElement.querySelector(
          '#editEmployee--userGroupId'
        ) as HTMLSelectElement

        for (const userGroup of exports.userGroups) {
          const optionElement = document.createElement('option')
          optionElement.value = userGroup.userGroupId.toString()
          optionElement.textContent = userGroup.userGroupName
          if (
            employee.userGroupId !== null &&
            employee.userGroupId !== undefined &&
            employee.userGroupId === userGroup.userGroupId
          ) {
            optionElement.selected = true
          }
          userGroupSelect.append(optionElement)
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateEmployee)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function buildEmployeeRowElement(employee: Employee): HTMLTableRowElement {
    const rowElement = document.createElement('tr')
    rowElement.dataset.employeeNumber = employee.employeeNumber

    const userGroup = exports.userGroups.find(
      (ug) => ug.userGroupId === employee.userGroupId
    )

    // eslint-disable-next-line no-unsanitized/property
    rowElement.innerHTML = /*html*/ `
      <td>
        ${
          employee.recordSync_isSynced
            ? /* html */ `
              <span class="is-size-7 has-text-grey" title="Synchronized">
                <i class="fa-solid fa-arrows-rotate"></i>
              </span>
            `
            : ''
        }
      </td>
      <td>
        ${cityssm.escapeHTML(employee.employeeNumber)}
      </td>
      <td>${cityssm.escapeHTML(employee.lastName)}, ${cityssm.escapeHTML(employee.firstName)}</td>
      <td class="has-text-centered">
        ${employee.isSupervisor ? '<i class="fa-solid fa-check"></i>' : '-'}
      </td>
      <td>${cityssm.escapeHTML(employee.userName ?? '')}</td>
      <td>${cityssm.escapeHTML(employee.phoneNumber ?? '')}</td>
      <td>${cityssm.escapeHTML(employee.emailAddress ?? '')}</td>
      <td>${userGroup === undefined ? '' : cityssm.escapeHTML(userGroup.userGroupName)}</td>
      <td class="has-text-right">
        <div class="buttons is-right">
          <button
            class="button is-small is-info edit-employee"
            data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
            title="Edit Employee"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-pencil"></i>
            </span>
            <span>Edit</span>
          </button>
          <button
            class="button is-small is-danger delete-employee"
            data-employee-number="${cityssm.escapeHTML(employee.employeeNumber)}"
            title="Delete Employee"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-trash"></i>
            </span>
            <span>Delete</span>
          </button>
        </div>
      </td>
    `

    return rowElement
  }

  function renderEmployees(employees: Employee[]): void {
    if (employees.length === 0) {
      employeesContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <div class="message-body">
            No employees available.
          </div>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className =
      'table is-fullwidth is-striped is-hoverable has-sticky-header'

    tableElement.innerHTML = /*html*/ `
      <thead>
        <tr>
          <th>
            <span class="is-sr-only">Sync Status</span>
          </th>
          <th>Employee Number</th>
          <th>Name</th>
          <th class="has-text-centered">Supervisor</th>
          <th>User Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>User Group</th>
          <th>
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    for (const employee of employees) {
      const rowElement = buildEmployeeRowElement(employee)
      tableElement.querySelector('tbody')?.append(rowElement)
    }

    // Add event listeners for edit buttons
    for (const button of tableElement.querySelectorAll('.edit-employee')) {
      button.addEventListener('click', editEmployee)
    }

    // Add event listeners for delete buttons
    for (const button of tableElement.querySelectorAll('.delete-employee')) {
      button.addEventListener('click', deleteEmployee)
    }

    employeesContainerElement.replaceChildren(tableElement)
  }

  /**
   * Render employees with pagination
   */
  function renderEmployeesWithPagination(employees: Employee[]): void {
    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    const paginatedEmployees = employees.slice(startIndex, endIndex)

    // Render table
    renderEmployees(paginatedEmployees)

    // Add pagination controls if needed
    if (employees.length > ITEMS_PER_PAGE) {
      const paginationControls = shiftLog.buildPaginationControls({
        totalCount: employees.length,
        currentPageOrOffset: currentPage,
        itemsPerPageOrLimit: ITEMS_PER_PAGE,
        clickHandler: pageSelect
      })

      employeesContainerElement.append(paginationControls)
    }
  }

  document
    .querySelector('#button--addEmployee')
    ?.addEventListener('click', () => {
      let closeModalFunction: () => void

      function doAddEmployee(submitEvent: Event): void {
        submitEvent.preventDefault()

        const addForm = submitEvent.currentTarget as HTMLFormElement

        cityssm.postJSON(
          `${shiftLog.urlPrefix}/admin/doAddEmployee`,
          addForm,
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              message?: string
              success: boolean

              employees?: Employee[]
            }

            if (responseJSON.success) {
              closeModalFunction()

              addForm.reset()

              // Update the employees list with the new data from the server
              if (responseJSON.employees !== undefined) {
                exports.employees = responseJSON.employees
                currentFilteredEmployees = responseJSON.employees
                currentPage = 1
                renderEmployeesWithPagination(responseJSON.employees)
              }

              bulmaJS.alert({
                contextualColorName: 'success',
                title: 'Employee Added',

                message:
                  'Employee has been successfully added. You can now edit it to add more details.'
              })
            } else {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Adding Employee',

                message: responseJSON.message ?? 'Please try again.'
              })
            }
          }
        )
      }

      cityssm.openHtmlModal('adminEmployees-add', {
        onshown(modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          closeModalFunction = _closeModalFunction

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doAddEmployee)
          ;(
            modalElement.querySelector(
              '#addEmployee--employeeNumber'
            ) as HTMLInputElement
          ).focus()
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  renderEmployeesWithPagination(exports.employees)

  /*
   * Filter employees with debouncing
   */
  const filterInput = document.querySelector(
    '#filter--employees'
  ) as HTMLInputElement | null

  let filterTimeout: ReturnType<typeof setTimeout> | undefined

  if (filterInput !== null) {
    filterInput.addEventListener('input', () => {
      // Clear existing timeout
      if (filterTimeout !== undefined) {
        clearTimeout(filterTimeout)
      }

      // Set new timeout (debounce for 300ms)
      filterTimeout = setTimeout(() => {
        const filterText = filterInput.value.toLowerCase()

        if (filterText === '') {
          currentFilteredEmployees = exports.employees
          currentPage = 1
          renderEmployeesWithPagination(exports.employees)
        } else {
          const filteredEmployees = exports.employees.filter(
            (possibleEmployee) => {
              const searchText =
                `${possibleEmployee.employeeNumber} ${possibleEmployee.firstName} ${possibleEmployee.lastName} ${possibleEmployee.userName ?? ''} ${possibleEmployee.phoneNumber ?? ''} ${possibleEmployee.emailAddress ?? ''}`.toLowerCase()
              return searchText.includes(filterText)
            }
          )

          currentFilteredEmployees = filteredEmployees
          currentPage = 1
          renderEmployeesWithPagination(filteredEmployees)
        }
      }, 300)
    })
  }
})()
