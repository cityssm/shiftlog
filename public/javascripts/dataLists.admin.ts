// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines, unicorn/no-null */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const Sortable: {
  create: (
    element: HTMLElement,
    options: {
      handle: string
      animation: number
      onEnd: () => void
    }
  ) => void
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
    let userGroupSelectElement: HTMLSelectElement

    // Build user group options
    let userGroupOptions = '<option value="">None (Available to All)</option>'
    for (const userGroup of exports.userGroups) {
      userGroupOptions += `<option value="${userGroup.userGroupId}">${cityssm.escapeHTML(userGroup.userGroupName)}</option>`
    }

    bulmaJS.confirm({
      contextualColorName: 'primary',
      message: /* html */ `
        <div class="field">
          <label class="label">Item Name</label>
          <div class="control">
            <input
              class="input"
              id="input--newItem"
              type="text"
              required
            />
          </div>
        </div>
        <div class="field">
          <label class="label">User Group (Optional)</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select id="select--userGroup">
                ${userGroupOptions}
              </select>
            </div>
          </div>
          <p class="help">If specified, only members of this user group will see this item.</p>
        </div>
      `,
      messageIsHtml: true,
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

          const userGroupIdValue = userGroupSelectElement.value
          const userGroupId = userGroupIdValue
            ? Number.parseInt(userGroupIdValue, 10)
            : null

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doAddDataListItem`,
            {
              dataListKey,
              dataListItem,
              userGroupId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                items?: DataListItemWithDetails[]
              }

              if (responseJSON.success && responseJSON.items !== undefined) {
                // Open the details panel if it's closed
                const detailsElement = document.querySelector(
                  `details[data-data-list-key="${dataListKey}"]`
                ) as HTMLDetailsElement

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
      },
      title: `Add ${dataList.dataListName} Item`
    })

    itemInputElement = document.querySelector(
      '#input--newItem'
    ) as HTMLInputElement

    userGroupSelectElement = document.querySelector(
      '#select--userGroup'
    ) as HTMLSelectElement

    itemInputElement.focus()
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

    let itemInputElement: HTMLInputElement
    let userGroupSelectElement: HTMLSelectElement

    // Build user group options
    let userGroupOptions = '<option value="">None (Available to All)</option>'
    for (const userGroup of exports.userGroups) {
      const selected =
        userGroupId &&
        Number.parseInt(userGroupId, 10) === userGroup.userGroupId
          ? 'selected'
          : ''
      userGroupOptions += `<option value="${userGroup.userGroupId}" ${selected}>${cityssm.escapeHTML(userGroup.userGroupName)}</option>`
    }

    bulmaJS.confirm({
      contextualColorName: 'info',
      title: `Edit ${dataList.dataListName} Item`,

      message: /* html */ `
        <div class="field">
          <label class="label">Item Name</label>
          <div class="control">
            <input
              class="input"
              id="input--editItem"
              type="text"
              value="${cityssm.escapeHTML(dataListItem)}"
              required
            />
          </div>
        </div>
        <div class="field">
          <label class="label">User Group (Optional)</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select id="select--editUserGroup">
                ${userGroupOptions}
              </select>
            </div>
          </div>
          <p class="help">If specified, only members of this user group will see this item.</p>
        </div>
      `,
      messageIsHtml: true,
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

          const userGroupIdValue = userGroupSelectElement.value
          const newUserGroupId = userGroupIdValue
            ? Number.parseInt(userGroupIdValue, 10)
            : null

          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doUpdateDataListItem`,
            {
              dataListKey,
              dataListItemId: Number.parseInt(dataListItemId, 10),
              dataListItem: newDataListItem,
              userGroupId: newUserGroupId
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
    userGroupSelectElement = document.querySelector(
      '#select--editUserGroup'
    ) as HTMLSelectElement
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

  // Initialize sortable for each data list
  for (const dataList of exports.dataLists) {
    const tbodyElement = document.querySelector(
      `#dataListItems--${dataList.dataListKey}`
    ) as HTMLElement | null

    if (tbodyElement !== null && dataList.items.length > 0) {
      Sortable.create(tbodyElement, {
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
