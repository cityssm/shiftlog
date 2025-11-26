// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type {
  DataListItem,
  Equipment,
  UserGroup
} from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
  equipment: Equipment[]
  userGroups: UserGroup[]
  equipmentTypes: DataListItem[]
}
;(() => {
  const shiftLog = exports.shiftLog

  const equipmentContainerElement = document.querySelector(
    '#container--equipment'
  ) as HTMLElement

  // Pagination settings
  const ITEMS_PER_PAGE = 10
  let currentPage = 1
  let currentFilteredEquipment: Equipment[] = exports.equipment

  /**
   * Build pagination controls for equipment list
   * Shows up to 10 page links including current page and neighboring pages
   */
  function buildPaginationControls(totalCount: number): HTMLElement {
    const paginationElement = document.createElement('nav')
    paginationElement.className = 'pagination is-centered mt-4'
    paginationElement.setAttribute('role', 'navigation')
    paginationElement.setAttribute('aria-label', 'pagination')

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    let paginationHTML = ''

    // Previous button
    paginationHTML +=
      currentPage > 1
        ? `<a class="pagination-previous" href="#" data-page-number="${
            currentPage - 1
          }">Previous</a>`
        : '<a class="pagination-previous" disabled>Previous</a>'

    // Next button
    paginationHTML +=
      currentPage < totalPages
        ? `<a class="pagination-next" href="#" data-page-number="${
            currentPage + 1
          }">Next</a>`
        : '<a class="pagination-next" disabled>Next</a>'

    // Page numbers with smart ellipsis
    paginationHTML += '<ul class="pagination-list">'

    const maxVisiblePages = 10
    let startPage = 1
    let endPage = totalPages

    if (totalPages > maxVisiblePages) {
      // Calculate range around current page
      const halfVisible = Math.floor(maxVisiblePages / 2)
      startPage = Math.max(1, currentPage - halfVisible)
      endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
    }

    // Always show first page
    if (startPage > 1) {
      paginationHTML += /* html */ `
        <li>
          <a class="pagination-link" data-page-number="1" href="#">1</a>
        </li>
      `
      if (startPage > 2) {
        paginationHTML += /* html */ `
          <li>
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
        `
      }
    }

    // Show page range
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      paginationHTML +=
        pageNumber === currentPage
          ? /* html */ `
            <li>
              <a class="pagination-link is-current" aria-current="page">${pageNumber}</a>
            </li>
          `
          : /* html */ `
            <li>
              <a class="pagination-link" data-page-number="${pageNumber}" href="#">${pageNumber}</a>
            </li>
          `
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML +=
          '<li><span class="pagination-ellipsis">&hellip;</span></li>'
      }
      paginationHTML += `<li><a class="pagination-link" data-page-number="${totalPages}" href="#">${totalPages}</a></li>`
    }

    paginationHTML += '</ul>'

    // eslint-disable-next-line no-unsanitized/property
    paginationElement.innerHTML = paginationHTML

    // Event listeners
    const pageLinks = paginationElement.querySelectorAll(
      'a.pagination-previous, a.pagination-next, a.pagination-link'
    )

    for (const pageLink of pageLinks) {
      pageLink.addEventListener('click', pageSelect)
    }

    return paginationElement
  }

  function pageSelect(event: Event): void {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement
    const pageNumberString = target.dataset.pageNumber

    if (pageNumberString !== undefined) {
      const pageNumber = Number.parseInt(pageNumberString, 10)
      currentPage = pageNumber
      renderEquipmentWithPagination(currentFilteredEquipment)
    }
  }

  function deleteEquipment(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const equipmentNumber = buttonElement.dataset.equipmentNumber

    if (equipmentNumber === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Equipment',

      message: 'Are you sure you want to delete this equipment?',
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete Equipment',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteEquipment`,
            {
              equipmentNumber
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                equipment?: Equipment[]
              }

              if (responseJSON.success) {
                if (responseJSON.equipment !== undefined) {
                  exports.equipment = responseJSON.equipment
                  currentFilteredEquipment = responseJSON.equipment
                  currentPage = 1
                  renderEquipmentWithPagination(responseJSON.equipment)
                }

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Equipment Deleted',

                  message: 'Equipment has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Equipment',

                  message: 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function editEquipment(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const equipmentNumber = buttonElement.dataset.equipmentNumber

    if (equipmentNumber === undefined) {
      return
    }

    const equipment = exports.equipment.find(
      (eq) => eq.equipmentNumber === equipmentNumber
    )

    if (equipment === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateEquipment(submitEvent: Event): void {
      submitEvent.preventDefault()

      const updateForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateEquipment`,
        updateForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            equipment?: Equipment[]
          }

          if (responseJSON.success) {
            closeModalFunction()

            if (responseJSON.equipment !== undefined) {
              exports.equipment = responseJSON.equipment
              currentFilteredEquipment = responseJSON.equipment
              currentPage = 1
              renderEquipmentWithPagination(responseJSON.equipment)
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Equipment Updated',

              message: 'Equipment has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Equipment',

              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminEquipment-edit', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '[name="equipmentNumber"]'
          ) as HTMLInputElement
        ).value = equipment.equipmentNumber
        ;(
          modalElement.querySelector(
            '[name="recordSync_isSynced"]'
          ) as HTMLInputElement
        ).checked = equipment.recordSync_isSynced
        ;(
          modalElement.querySelector(
            '[name="equipmentName"]'
          ) as HTMLInputElement
        ).value = equipment.equipmentName
        ;(
          modalElement.querySelector(
            '[name="equipmentDescription"]'
          ) as HTMLTextAreaElement
        ).value = equipment.equipmentDescription

        // Populate equipment types dropdown
        const equipmentTypeSelect = modalElement.querySelector(
          '[name="equipmentTypeDataListItemId"]'
        ) as HTMLSelectElement
        equipmentTypeSelect.innerHTML =
          '<option value="">Select Equipment Type</option>'

        for (const equipmentType of exports.equipmentTypes) {
          const option = document.createElement('option')
          option.value = equipmentType.dataListItemId.toString()
          option.textContent = equipmentType.dataListItem
          equipmentTypeSelect.append(option)
        }

        equipmentTypeSelect.value =
          equipment.equipmentTypeDataListItemId.toString()

        // Populate user groups dropdown
        const userGroupSelect = modalElement.querySelector(
          '[name="userGroupId"]'
        ) as HTMLSelectElement

        userGroupSelect.innerHTML = '<option value="">No User Group</option>'

        for (const userGroup of exports.userGroups) {
          const option = document.createElement('option')
          option.value = userGroup.userGroupId.toString()
          option.textContent = userGroup.userGroupName
          userGroupSelect.append(option)
        }

        userGroupSelect.value = equipment.userGroupId?.toString() ?? ''
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateEquipment)
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function renderEquipment(equipmentList: Equipment[]): void {
    if (equipmentList.length === 0) {
      equipmentContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <div class="message-body">
            No equipment records available.
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
          <th>Equipment Number</th>
          <th>Equipment Name</th>
          <th>Description</th>
          <th>Type</th>
          <th>User Group</th>
          <th class="has-text-right">Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tbodyElement = tableElement.querySelector('tbody') as HTMLElement

    for (const equipment of equipmentList) {
      const rowElement = document.createElement('tr')

      rowElement.innerHTML = /*html*/ `
        <td>${cityssm.escapeHTML(equipment.equipmentNumber)}</td>
        <td>${cityssm.escapeHTML(equipment.equipmentName)}</td>
        <td>${cityssm.escapeHTML(equipment.equipmentDescription)}</td>
        <td>${cityssm.escapeHTML(equipment.equipmentTypeDataListItem ?? '')}</td>
        <td>${cityssm.escapeHTML(equipment.userGroupName ?? '')}</td>
        <td class="has-text-right">
          <div class="buttons is-right">
            <button class="button is-small is-info edit-equipment" 
              data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}" 
              type="button"
            >
              <span class="icon is-small">
                <i class="fa-solid fa-edit"></i>
              </span>
              <span>Edit</span>
            </button>
            <button class="button is-small is-danger delete-equipment" 
              data-equipment-number="${cityssm.escapeHTML(equipment.equipmentNumber)}" 
              type="button"
            >
              <span class="icon is-small">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `

      tbodyElement.append(rowElement)
    }

    equipmentContainerElement.replaceChildren(tableElement)

    const editButtons =
      equipmentContainerElement.querySelectorAll('.edit-equipment')
    for (const button of editButtons) {
      button.addEventListener('click', editEquipment)
    }

    const deleteButtons =
      equipmentContainerElement.querySelectorAll('.delete-equipment')
    for (const button of deleteButtons) {
      button.addEventListener('click', deleteEquipment)
    }
  }

  /**
   * Render equipment with pagination
   */
  function renderEquipmentWithPagination(equipmentList: Equipment[]): void {
    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    const paginatedEquipment = equipmentList.slice(startIndex, endIndex)

    // Render table
    renderEquipment(paginatedEquipment)

    // Add pagination controls if needed
    if (equipmentList.length > ITEMS_PER_PAGE) {
      const paginationControls = buildPaginationControls(equipmentList.length)

      equipmentContainerElement.append(paginationControls)
    }
  }

  function addEquipment(): void {
    let closeModalFunction: () => void

    function doAddEquipment(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddEquipment`,
        addForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            equipment?: Equipment[]
          }

          if (responseJSON.success) {
            closeModalFunction()

            if (responseJSON.equipment !== undefined) {
              exports.equipment = responseJSON.equipment
              currentFilteredEquipment = responseJSON.equipment
              currentPage = 1
              renderEquipmentWithPagination(responseJSON.equipment)
            }

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Equipment Added',

              message: 'Equipment has been successfully added.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Equipment',

              message:
                'Please check the equipment number is unique and try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminEquipment-add', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '[name="equipmentNumber"]'
          ) as HTMLInputElement
        ).value = ''
        ;(
          modalElement.querySelector(
            '[name="equipmentName"]'
          ) as HTMLInputElement
        ).value = ''
        ;(
          modalElement.querySelector(
            '[name="equipmentDescription"]'
          ) as HTMLTextAreaElement
        ).value = ''

        // Populate equipment types dropdown
        const equipmentTypeSelect = modalElement.querySelector(
          '[name="equipmentTypeDataListItemId"]'
        ) as HTMLSelectElement

        equipmentTypeSelect.innerHTML =
          '<option value="">Select Equipment Type</option>'

        for (const equipmentType of exports.equipmentTypes) {
          const option = document.createElement('option')
          option.value = equipmentType.dataListItemId.toString()
          option.textContent = equipmentType.dataListItem
          equipmentTypeSelect.append(option)
        }

        // Populate user groups dropdown
        const userGroupSelect = modalElement.querySelector(
          '[name="userGroupId"]'
        ) as HTMLSelectElement

        userGroupSelect.innerHTML = '<option value="">No User Group</option>'

        for (const userGroup of exports.userGroups) {
          const option = document.createElement('option')
          option.value = userGroup.userGroupId.toString()
          option.textContent = userGroup.userGroupName
          userGroupSelect.append(option)
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddEquipment)
        ;(
          modalElement.querySelector(
            '[name="equipmentNumber"]'
          ) as HTMLInputElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  document
    .querySelector('#button--addEquipment')
    ?.addEventListener('click', addEquipment)

  renderEquipmentWithPagination(exports.equipment)

  /*
   * Filter equipment with debouncing
   */
  const filterInput = document.querySelector(
    '#filter--equipment'
  ) as HTMLInputElement | null
  let filterTimeout: ReturnType<typeof setTimeout> | null = null

  if (filterInput !== null) {
    filterInput.addEventListener('input', () => {
      // Clear existing timeout
      if (filterTimeout !== null) {
        clearTimeout(filterTimeout)
      }

      // Set new timeout (debounce for 300ms)
      filterTimeout = setTimeout(() => {
        const filterText = filterInput.value.toLowerCase()

        if (filterText === '') {
          currentFilteredEquipment = exports.equipment
          currentPage = 1
          renderEquipmentWithPagination(exports.equipment)
        } else {
          const filteredEquipment = exports.equipment.filter((equipment) => {
            const searchText =
              `${equipment.equipmentNumber} ${equipment.equipmentName} ${equipment.equipmentDescription} ${equipment.equipmentTypeDataListItem ?? ''}`.toLowerCase()
            return searchText.includes(filterText)
          })

          currentFilteredEquipment = filteredEquipment
          currentPage = 1
          renderEquipmentWithPagination(filteredEquipment)
        }
      }, 300)
    })
  }
})()
