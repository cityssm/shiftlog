/* eslint-disable max-lines -- Large file */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddDataListResponse } from '../../handlers/admin-post/doAddDataList.js'
import type { DoAddDataListItemResponse } from '../../handlers/admin-post/doAddDataListItem.js'
import type { DoDeleteDataListResponse } from '../../handlers/admin-post/doDeleteDataList.js'
import type { DoDeleteDataListItemResponse } from '../../handlers/admin-post/doDeleteDataListItem.js'
import type { DoReorderDataListItemsResponse } from '../../handlers/admin-post/doReorderDataListItems.js'
import type { DoUpdateDataListResponse } from '../../handlers/admin-post/doUpdateDataList.js'
import type { DoUpdateDataListItemResponse } from '../../handlers/admin-post/doUpdateDataListItem.js'

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

      countElement.classList.toggle('is-warning', count === 0)
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
      tbodyElement.innerHTML = /* html */ `
        <tr>
          <td class="has-text-centered has-text-grey" colspan="4">
            No items in this list. Click "Add Item" to create one.
          </td>
        </tr>
      `
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

  function renderAllDataLists(dataLists: DataListWithItems[]): void {
    // Update the global dataLists
    exports.dataLists = dataLists

    // Find the container that holds all the detail panels
    const messageBlock = document.querySelector('.message.is-info')

    if (messageBlock === null) {
      // Fallback to page reload if we can't find the container
      globalThis.location.reload()
      return
    }

    // Get the parent that contains all the panels
    const panelsContainer = messageBlock.parentElement

    if (panelsContainer === null) {
      globalThis.location.reload()
      return
    }

    // Remove all existing panels
    const existingPanels = panelsContainer.querySelectorAll('details.panel')
    for (const panel of existingPanels) {
      panel.remove()
    }

    // Re-render all panels from scratch
    for (const dataList of dataLists) {
      const panelHtml = /* html */ `
        <details class="panel mb-5 collapsable-panel" data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}" data-is-system-list="${dataList.isSystemList}">
          <summary class="panel-heading is-clickable">
            <span class="icon-text">
              <span class="icon">
                <i class="fa-solid fa-chevron-right details-chevron"></i>
              </span>
              <span class="has-text-weight-semibold mr-2">
                ${cityssm.escapeHTML(dataList.dataListName)}
              </span>
              <span class="tag is-rounded ${dataList.items.length === 0 ? 'is-warning' : ''}" id="itemCount--${cityssm.escapeHTML(dataList.dataListKey)}">
                ${dataList.items.length}
              </span>
              ${dataList.isSystemList ? '' : '<span class="tag is-info is-light ml-2">Custom</span>'}
            </span>
          </summary>
          <div class="panel-block is-block">
            <div class="columns is-mobile">
              ${
                dataList.isSystemList
                  ? ''
                  : /* html */ `
                    <div class="column is-narrow">
                      <button
                        class="button is-info is-small button--renameDataList" 
                        data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}"
                        data-data-list-name="${cityssm.escapeHTML(dataList.dataListName)}"
                        type="button"
                      >
                        <span class="icon">
                          <i class="fa-solid fa-pencil"></i>
                        </span>
                        <span>Rename List</span>
                      </button>
    
                      <button
                        class="button is-danger is-small button--deleteDataList" 
                        data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}"
                        data-data-list-name="${cityssm.escapeHTML(dataList.dataListName)}"
                        type="button"
                      >
                        <span class="icon">
                          <i class="fa-solid fa-trash"></i>
                        </span>
                        <span>Delete List</span>
                      </button>
                    </div>
                  `
              }
              <div class="column has-text-right">
                <button
                  class="button is-success is-small button--addItem" 
                  data-data-list-key="${cityssm.escapeHTML(dataList.dataListKey)}"
                  type="button"
                >
                  <span class="icon">
                    <i class="fa-solid fa-plus"></i>
                  </span>
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          </div>
          <div class="panel-block p-0">
            <div class="table-container" style="width: 100%;">
              <table class="table is-striped is-hoverable is-fullwidth mb-0">
                <thead>
                  <tr>
                    <th class="has-text-centered" style="width: 60px;">Order</th>
                    <th>Item</th>
                    <th style="width: 180px;">User Group</th>
                    <th>
                      <span class="is-sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="is-sortable" id="dataListItems--${cityssm.escapeHTML(dataList.dataListKey)}">
                </tbody>
              </table>
            </div>
          </div>
        </details>
      `

      const tempDiv = document.createElement('div')
      // eslint-disable-next-line no-unsanitized/property
      tempDiv.innerHTML = panelHtml
      const panelElement = tempDiv.firstElementChild

      if (panelElement !== null) {
        panelsContainer.append(panelElement)

        // Render items for this list (use items variable which has the default)
        renderDataListItems(dataList.dataListKey, dataList.items)

        // Initialize sortable for this list
        initializeSortable(dataList.dataListKey)
      }
    }

    // Re-attach all event listeners
    attachAllEventListeners()
  }

  function attachAllEventListeners(): void {
    // Add Data List button
    const addDataListButton = document.querySelector('.button--addDataList')
    if (addDataListButton !== null) {
      addDataListButton.addEventListener('click', addDataList)
    }

    // Rename Data List buttons
    const renameButtons = document.querySelectorAll('.button--renameDataList')
    for (const button of renameButtons) {
      button.addEventListener('click', renameDataList)
    }

    // Delete Data List buttons
    const deleteDataListButtons = document.querySelectorAll(
      '.button--deleteDataList'
    )
    for (const button of deleteDataListButtons) {
      button.addEventListener('click', deleteDataList)
    }

    // Add item buttons
    const addButtons = document.querySelectorAll('.button--addItem')
    for (const button of addButtons) {
      button.addEventListener('click', addDataListItem)
    }

    // Re-attach event listeners for each data list's items
    for (const dataList of exports.dataLists) {
      attachEventListeners(dataList.dataListKey)
    }
  }

  function addDataList(clickEvent: Event): void {
    clickEvent.preventDefault()

    let closeModalFunction: () => void

    function doAddDataList(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement
      const formData = new FormData(addForm)

      const dataListKeySuffix = (
        formData.get('dataListKey') as string | null
      )?.trim()
      const dataListName = (
        formData.get('dataListName') as string | null
      )?.trim()

      if (dataListKeySuffix === '' || dataListName === '') {
        bulmaJS.alert({
          contextualColorName: 'warning',
          title: 'Required Fields',
          message: 'Please fill in all required fields.'
        })
        return
      }

      // Prepend "user-" to the key
      const dataListKey = `user-${dataListKeySuffix}`

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddDataList`,
        {
          dataListKey,
          dataListName
        },
        (responseJSON: DoAddDataListResponse) => {
          if (responseJSON.success && responseJSON.dataLists !== undefined) {
            closeModalFunction()

            // Render the updated list
            renderAllDataLists(responseJSON.dataLists)

            const message = responseJSON.wasRecovered
              ? 'The previously deleted data list has been recovered.'
              : 'The data list has been successfully created.'

            bulmaJS.alert({
              contextualColorName: 'success',
              title: responseJSON.wasRecovered
                ? 'Data List Recovered'
                : 'Data List Created',
              message
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Creating Data List',
              message: responseJSON.errorMessage ?? 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminDataLists-addDataList', {
      onshow(modalElement) {
        // Attach form submit handler
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doAddDataList)
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction

        // Focus the key input
        const keyInput = modalElement.querySelector(
          '#addDataList--dataListKey'
        ) as HTMLInputElement
        keyInput.focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function renameDataList(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const dataListKey = buttonElement.dataset.dataListKey
    const dataListName = buttonElement.dataset.dataListName

    if (dataListKey === undefined || dataListName === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateDataList(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement
      const formData = new FormData(editForm)
      const newDataListName = (
        formData.get('dataListName') as string | null
      )?.trim()

      if (newDataListName === '') {
        bulmaJS.alert({
          contextualColorName: 'warning',
          title: 'Name Required',
          message: 'Please enter a display name.'
        })
        return
      }

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateDataList`,
        editForm,
        (responseJSON: DoUpdateDataListResponse) => {
          if (responseJSON.success && responseJSON.dataLists !== undefined) {
            closeModalFunction()
            renderAllDataLists(responseJSON.dataLists)

            bulmaJS.alert({
              contextualColorName: 'success',
              title: 'Data List Renamed',
              message: 'The data list has been successfully renamed.'
            })
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Renaming Data List',
              message: responseJSON.errorMessage ?? 'Please try again.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminDataLists-editDataList', {
      onshow(modalElement) {
        // Set the data list key
        const dataListKeyInput = modalElement.querySelector(
          '#editDataList--dataListKey'
        ) as HTMLInputElement
        dataListKeyInput.value = dataListKey

        // Set the data list name
        const dataListNameInput = modalElement.querySelector(
          '#editDataList--dataListName'
        ) as HTMLInputElement
        dataListNameInput.value = dataListName

        // Attach form submit handler
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateDataList)
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction

        // Focus and select the input
        const nameInput = modalElement.querySelector(
          '#editDataList--dataListName'
        ) as HTMLInputElement
        nameInput.focus()
        nameInput.select()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteDataList(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const dataListKey = buttonElement.dataset.dataListKey
    const dataListName = buttonElement.dataset.dataListName

    if (dataListKey === undefined || dataListName === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Data List',
      message: `Are you sure you want to delete "${dataListName}"? This will also delete all items in this list. This action cannot be undone.`,
      okButton: {
        contextualColorName: 'danger',
        text: 'Delete Data List',
        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteDataList`,
            {
              dataListKey
            },
            (responseJSON: DoDeleteDataListResponse) => {
              if (
                responseJSON.success &&
                responseJSON.dataLists !== undefined
              ) {
                // Render the updated list
                renderAllDataLists(responseJSON.dataLists)

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Data List Deleted',
                  message: 'The data list has been successfully deleted.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Data List',
                  message: responseJSON.errorMessage ?? 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
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
      const formData = new FormData(addForm)

      const dataListItemToAdd = (
        formData.get('dataListItem') as string | null
      )?.trim()

      if (dataListItemToAdd === '') {
        bulmaJS.alert({
          contextualColorName: 'warning',
          title: 'Item Name Required',

          message: 'Please enter an item name.'
        })
        return
      }

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddDataListItem`,
        addForm,
        (responseJSON: DoAddDataListItemResponse) => {
          if (responseJSON.success && responseJSON.items !== undefined) {
            closeModalFunction()

            // Open the details panel if it's closed
            const detailsElement = document.querySelector(
              `details[data-data-list-key="${dataListKey}"]`
            ) as HTMLDetailsElement | null

            if (detailsElement !== null && !detailsElement.open) {
              detailsElement.open = true
            }

            renderDataListItems(dataListKey as string, responseJSON.items)

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
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction

        // Focus the item name input
        const itemInput = modalElement.querySelector(
          '#addDataListItem--dataListItem'
        ) as HTMLInputElement
        itemInput.focus()
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
      const formData = new FormData(editForm)
      const dataListItem = (
        formData.get('dataListItem') as string | null
      )?.trim()

      if (dataListItem === '') {
        bulmaJS.alert({
          contextualColorName: 'warning',
          title: 'Item Name Required',

          message: 'Please enter an item name.'
        })
        return
      }

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateDataListItem`,
        editForm,
        (responseJSON: DoUpdateDataListItemResponse) => {
          if (responseJSON.success && responseJSON.items !== undefined) {
            closeModalFunction()
            renderDataListItems(dataListKey as string, responseJSON.items)

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
            (responseJSON: DoDeleteDataListItemResponse) => {
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
          (responseJSON: DoReorderDataListItemsResponse) => {
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

  renderAllDataLists(exports.dataLists)
})()
