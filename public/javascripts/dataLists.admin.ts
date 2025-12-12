// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines, unicorn/no-null */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

interface SortableInstance {
  destroy: () => void
}

declare const Sortable: {
  create: (
    element: HTMLElement,
    options: {
      handle: string
      animation: number
      onEnd: () => void
    }
  ) => SortableInstance
}

interface DataListItemWithDetails {
  dataListItemId: number
  dataListKey: string
  dataListItem: string
  orderNumber: number
  userGroupId: number | null
}

interface DataListWithItems {
  dataListKey: string
  dataListName: string
  isSystemList: boolean
  items: DataListItemWithDetails[]
}

interface UserGroup {
  userGroupId: number
  userGroupName: string
  memberCount?: number
}

declare const exports: {
  shiftLog: ShiftLogGlobal
  dataLists: DataListWithItems[]
  userGroups: UserGroup[]
}
;(() => {
  const shiftLog = exports.shiftLog

  // Track Sortable instances to prevent duplicates
  const sortableInstances = new Map<string, SortableInstance>()

  function updateItemCount(dataListKey: string, count: number): void {
    const countElement = document.querySelector(`#itemCount--${dataListKey}`)

    if (countElement !== null) {
      countElement.textContent = count.toString()
    }
  }

  function renderDataListItems(
    dataListKey: string,
    items: DataListItemWithDetails[]
  ): void {
    const tbodyElement = document.querySelector(
      `#dataListItems--${dataListKey}`
    )

    if (tbodyElement === null) {
      return
    }

    // Update the item count tag
    updateItemCount(dataListKey, items.length)

    if (items.length === 0) {
      tbodyElement.innerHTML = `<tr>
        <td colspan="4" class="has-text-centered has-text-grey">
          No items in this list. Click "Add Item" to create one.
        </td>
      </tr>`
      return
    }

    // Clear existing items
    tbodyElement.innerHTML = ''

    for (const item of items) {
      const userGroup = item.userGroupId
        ? exports.userGroups.find((ug) => ug.userGroupId === item.userGroupId)
        : null

      const userGroupDisplay = userGroup
        ? `<span class="tag is-info">${cityssm.escapeHTML(userGroup.userGroupName)}</span>`
        : '<span class="has-text-grey-light">-</span>'

      const tableRowElement = document.createElement('tr')
      tableRowElement.dataset.dataListItemId = item.dataListItemId.toString()

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td class="has-text-centered">
          <span class="icon is-small has-text-grey handle" style="cursor: move;">
            <i class="fa-solid fa-grip-vertical"></i>
          </span>
        </td>
        <td>
          <span class="item-text">
            ${cityssm.escapeHTML(item.dataListItem)}
          </span>
        </td>
        <td>
          ${userGroupDisplay}
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button
              class="button is-info button--editItem"
              data-data-list-key="${cityssm.escapeHTML(dataListKey)}"
              data-data-list-item-id="${item.dataListItemId}"
              data-data-list-item="${cityssm.escapeHTML(item.dataListItem)}"
              data-user-group-id="${item.userGroupId ?? ''}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit</span>
            </button>
            <button
              class="button is-danger button--deleteItem"
              data-data-list-key="${cityssm.escapeHTML(dataListKey)}"
              data-data-list-item-id="${item.dataListItemId}"
              data-data-list-item="${cityssm.escapeHTML(item.dataListItem)}"
              type="button"
            >
              <span class="icon">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `

      tbodyElement.append(tableRowElement)
    }

    // Re-attach event listeners
    attachEventListeners(dataListKey)
    // Re-initialize sortable
    initializeSortable(dataListKey)
  }

  function addDataListItem(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const dataListKey = buttonElement.dataset.dataListKey

    if (dataListKey === undefined) {
      return
    }

    const dataList = exports.dataLists.find(
      (dl) => dl.dataListKey === dataListKey
    )

    if (dataList === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doAddDataListItem(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddDataListItem`,
        addForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            items?: DataListItemWithDetails[]
          }

          if (responseJSON.success && responseJSON.items !== undefined) {
            closeModalFunction()

            // Open the details panel if it's closed
            const detailsElement = document.querySelector(
              `details[data-data-list-key="${dataListKey}"]`
            ) as HTMLDetailsElement | null

            if (detailsElement !== null && !detailsElement.open) {
              detailsElement.open = true
            }

            renderDataListItems(dataListKey, responseJSON.items)

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Item Added',
              message: 'The item has been successfully added.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Item',
              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminDataLists-addItem', {
      onshow(modalElement) {
        // Set the modal title
        const titleElement = modalElement.querySelector(
          '#addDataListItem--title'
        ) as HTMLElement
        titleElement.textContent = `Add ${dataList.dataListName} Item`

        // Set the data list key
        const dataListKeyInput = modalElement.querySelector(
          '#addDataListItem--dataListKey'
        ) as HTMLInputElement
        dataListKeyInput.value = dataListKey

        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#addDataListItem--userGroupId'
        ) as HTMLSelectElement

        userGroupSelect.innerHTML =
          '<option value="">None (Available to All)</option>'

        for (const userGroup of exports.userGroups) {
          const option = document.createElement('option')
          option.value = userGroup.userGroupId.toString()
          option.textContent = userGroup.userGroupName
          userGroupSelect.append(option)
        }

        // Attach form submit handler
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddDataListItem)
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

  function editDataListItem(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const dataListKey = buttonElement.dataset.dataListKey
    const dataListItemId = buttonElement.dataset.dataListItemId
    const dataListItem = buttonElement.dataset.dataListItem
    const userGroupId = buttonElement.dataset.userGroupId

    if (
      dataListKey === undefined ||
      dataListItemId === undefined ||
      dataListItem === undefined
    ) {
      return
    }

    const dataList = exports.dataLists.find(
      (dl) => dl.dataListKey === dataListKey
    )

    if (dataList === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateDataListItem(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateDataListItem`,
        editForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            items?: DataListItemWithDetails[]
          }

          if (responseJSON.success && responseJSON.items !== undefined) {
            closeModalFunction()
            renderDataListItems(dataListKey, responseJSON.items)
            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Item Updated',
              message: 'The item has been successfully updated.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Item',
              message: 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminDataLists-editItem', {
      onshow(modalElement) {
        // Set the modal title
        const titleElement = modalElement.querySelector(
          '#editDataListItem--title'
        ) as HTMLElement
        titleElement.textContent = `Edit ${dataList.dataListName} Item`

        // Set the hidden fields
        const dataListKeyInput = modalElement.querySelector(
          '#editDataListItem--dataListKey'
        ) as HTMLInputElement
        dataListKeyInput.value = dataListKey

        const dataListItemIdInput = modalElement.querySelector(
          '#editDataListItem--dataListItemId'
        ) as HTMLInputElement
        dataListItemIdInput.value = dataListItemId

        // Set the item name
        const dataListItemInput = modalElement.querySelector(
          '#editDataListItem--dataListItem'
        ) as HTMLInputElement
        dataListItemInput.value = dataListItem

        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#editDataListItem--userGroupId'
        ) as HTMLSelectElement

        userGroupSelect.innerHTML =
          '<option value="">None (Available to All)</option>'

        for (const userGroup of exports.userGroups) {
          const option = document.createElement('option')
          option.value = userGroup.userGroupId.toString()
          option.textContent = userGroup.userGroupName

          if (
            userGroupId &&
            Number.parseInt(userGroupId, 10) === userGroup.userGroupId
          ) {
            option.selected = true
          }

          userGroupSelect.append(option)
        }

        // Attach form submit handler
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateDataListItem)
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction

        // Focus and select the input
        const itemInput = modalElement.querySelector(
          '#editDataListItem--dataListItem'
        ) as HTMLInputElement
        itemInput.focus()
        itemInput.select()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteDataListItem(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const dataListKey = buttonElement.dataset.dataListKey
    const dataListItemId = buttonElement.dataset.dataListItemId
    const dataListItem = buttonElement.dataset.dataListItem

    if (
      dataListKey === undefined ||
      dataListItemId === undefined ||
      dataListItem === undefined
    ) {
      return
    }

    const dataList = exports.dataLists.find(
      (dl) => dl.dataListKey === dataListKey
    )

    if (dataList === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: `Delete ${dataList.dataListName} Item`,

      message: `Are you sure you want to delete "${dataListItem}"? This action cannot be undone.`,
      okButton: {
        contextualColorName: 'danger',
        text: 'Delete Item',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteDataListItem`,
            {
              dataListKey,
              dataListItemId: Number.parseInt(dataListItemId, 10)
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                items?: DataListItemWithDetails[]
              }

              if (responseJSON.success && responseJSON.items !== undefined) {
                renderDataListItems(dataListKey, responseJSON.items)
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Item Deleted',

                  message: 'The item has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Item',

                  message: 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function attachEventListeners(dataListKey: string): void {
    const section = document.querySelector(
      `[data-data-list-key="${dataListKey}"]`
    )

    if (section === null) {
      return
    }

    // Edit buttons
    const editButtons = section.querySelectorAll('.button--editItem')
    for (const button of editButtons) {
      button.addEventListener('click', editDataListItem)
    }

    // Delete buttons
    const deleteButtons = section.querySelectorAll('.button--deleteItem')
    for (const button of deleteButtons) {
      button.addEventListener('click', deleteDataListItem)
    }
  }

  function initializeSortable(dataListKey: string): void {
    const tbodyElement = document.querySelector(
      `#dataListItems--${dataListKey}`
    ) as HTMLElement | null

    if (tbodyElement === null) {
      return
    }

    // Check if the tbody has any sortable items (rows with data-data-list-item-id)
    const hasItems =
      tbodyElement.querySelectorAll('tr[data-data-list-item-id]').length > 0

    if (!hasItems) {
      // Destroy existing instance if no items
      const existingInstance = sortableInstances.get(dataListKey)
      if (existingInstance !== undefined) {
        existingInstance.destroy()
        sortableInstances.delete(dataListKey)
      }
      return
    }

    // Destroy existing Sortable instance before creating a new one
    const existingInstance = sortableInstances.get(dataListKey)
    if (existingInstance !== undefined) {
      existingInstance.destroy()
    }

    // Create new Sortable instance
    const sortableInstance = Sortable.create(tbodyElement, {
      handle: '.handle',
      animation: 150,
      onEnd() {
        // Get the new order
        const rows = tbodyElement.querySelectorAll(
          'tr[data-data-list-item-id]'
        ) as NodeListOf<HTMLElement>

        const dataListItemIds: number[] = []

        for (const row of rows) {
          const dataListItemId = row.dataset.dataListItemId
          if (dataListItemId !== undefined) {
            dataListItemIds.push(Number.parseInt(dataListItemId, 10))
          }
        }

        // Send to server
        cityssm.postJSON(
          `${shiftLog.urlPrefix}/admin/doReorderDataListItems`,
          {
            dataListKey,
            dataListItemIds
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              items?: DataListItemWithDetails[]
            }

            if (!responseJSON.success) {
              bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Reordering Items',

                message: 'Please refresh the page and try again.'
              })
            }
          }
        )
      }
    })

    // Store the instance for future reference
    sortableInstances.set(dataListKey, sortableInstance)
  }

  // Initialize sortable for each data list
  for (const dataList of exports.dataLists) {
    initializeSortable(dataList.dataListKey)

    // Attach event listeners for this data list
    attachEventListeners(dataList.dataListKey)
  }

  // Add item buttons
  const addButtons = document.querySelectorAll('.button--addItem')
  for (const button of addButtons) {
    button.addEventListener('click', addDataListItem)
  }
})()
