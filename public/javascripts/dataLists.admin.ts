import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const Sortable: {
  create: (element: HTMLElement, options: {
    handle: string
    animation: number
    onEnd: () => void
  }) => void
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

declare const exports: {
  shiftLog: ShiftLogGlobal
  dataLists: DataListWithItems[]
}
;(() => {
  const shiftLog = exports.shiftLog

  function renderDataListItems(
    dataListKey: string,
    items: DataListItemWithDetails[]
  ): void {
    const tbodyElement = document.querySelector(
      `#dataListItems--${dataListKey}`
    ) as HTMLElement

    if (tbodyElement === null) {
      return
    }

    if (items.length === 0) {
      tbodyElement.innerHTML = `<tr>
        <td colspan="3" class="has-text-centered has-text-grey">
          No items in this list. Click "Add Item" to create one.
        </td>
      </tr>`
      return
    }

    let html = ''

    for (const item of items) {
      html += `<tr data-data-list-item-id="${item.dataListItemId}">
        <td class="has-text-centered">
          <span class="icon is-small has-text-grey handle" style="cursor: move;">
            <i class="fa-solid fa-grip-vertical"></i>
          </span>
        </td>
        <td>
          <span class="item-text">${cityssm.escapeHTML(item.dataListItem)}</span>
        </td>
        <td>
          <div class="buttons are-small">
            <button class="button is-info button--editItem" 
                    type="button"
                    data-data-list-key="${dataListKey}"
                    data-data-list-item-id="${item.dataListItemId}"
                    data-data-list-item="${cityssm.escapeHTML(item.dataListItem)}">
              <span class="icon">
                <i class="fa-solid fa-pencil"></i>
              </span>
              <span>Edit</span>
            </button>
            <button class="button is-danger button--deleteItem" 
                    type="button"
                    data-data-list-key="${dataListKey}"
                    data-data-list-item-id="${item.dataListItemId}"
                    data-data-list-item="${cityssm.escapeHTML(item.dataListItem)}">
              <span class="icon">
                <i class="fa-solid fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>`
    }

    tbodyElement.innerHTML = html

    // Re-attach event listeners
    attachEventListeners(dataListKey)
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

    let itemInputElement: HTMLInputElement

    bulmaJS.confirm({
      title: `Add ${dataList.dataListName} Item`,
      message: `<div class="field">
        <label class="label">Item Name</label>
        <div class="control">
          <input class="input" id="input--newItem" type="text" required />
        </div>
      </div>`,
      messageIsHtml: true,
      contextualColorName: 'primary',
      okButton: {
        text: 'Add Item',
        callbackFunction() {
          const dataListItem = itemInputElement.value.trim()

          if (dataListItem === '') {
            bulmaJS.alert({
              contextualColorName: 'warning',
              title: 'Item Name Required',
              message: 'Please enter an item name.'
            })
            return
          }

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doAddDataListItem`,
            {
              dataListKey,
              dataListItem
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
      }
    })

    itemInputElement = document.querySelector(
      '#input--newItem'
    ) as HTMLInputElement
    itemInputElement.focus()
  }

  function editDataListItem(clickEvent: Event): void {
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

    let itemInputElement: HTMLInputElement

    bulmaJS.confirm({
      title: `Edit ${dataList.dataListName} Item`,
      message: `<div class="field">
        <label class="label">Item Name</label>
        <div class="control">
          <input class="input" id="input--editItem" type="text" value="${cityssm.escapeHTML(dataListItem)}" required />
        </div>
      </div>`,
      messageIsHtml: true,
      contextualColorName: 'info',
      okButton: {
        text: 'Update Item',
        callbackFunction() {
          const newDataListItem = itemInputElement.value.trim()

          if (newDataListItem === '') {
            bulmaJS.alert({
              contextualColorName: 'warning',
              title: 'Item Name Required',
              message: 'Please enter an item name.'
            })
            return
          }

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doUpdateDataListItem`,
            {
              dataListKey,
              dataListItemId: Number.parseInt(dataListItemId),
              dataListItem: newDataListItem
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
      }
    })

    itemInputElement = document.querySelector(
      '#input--editItem'
    ) as HTMLInputElement
    itemInputElement.focus()
    itemInputElement.select()
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
      title: `Delete ${dataList.dataListName} Item`,
      message: `Are you sure you want to delete "${dataListItem}"? This action cannot be undone.`,
      contextualColorName: 'warning',
      okButton: {
        text: 'Delete Item',
        contextualColorName: 'danger',
        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doDeleteDataListItem`,
            {
              dataListKey,
              dataListItemId: Number.parseInt(dataListItemId)
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
    ) as HTMLElement

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

  // Initialize sortable for each data list
  for (const dataList of exports.dataLists) {
    const tbodyElement = document.querySelector(
      `#dataListItems--${dataList.dataListKey}`
    ) as HTMLElement

    if (tbodyElement !== null && dataList.items.length > 0) {
      Sortable.create(tbodyElement, {
        handle: '.handle',
        animation: 150,
        onEnd() {
          // Get the new order
          const rows = tbodyElement.querySelectorAll('tr[data-data-list-item-id]')
          const dataListItemIds: number[] = []

          for (const row of rows) {
            const dataListItemId = (row as HTMLElement).dataset.dataListItemId
            if (dataListItemId !== undefined) {
              dataListItemIds.push(Number.parseInt(dataListItemId))
            }
          }

          // Send to server
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doReorderDataListItems`,
            {
              dataListKey: dataList.dataListKey,
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
    }

    // Attach event listeners for this data list
    attachEventListeners(dataList.dataListKey)
  }

  // Add item buttons
  const addButtons = document.querySelectorAll('.button--addItem')
  for (const button of addButtons) {
    button.addEventListener('click', addDataListItem)
  }
})()
