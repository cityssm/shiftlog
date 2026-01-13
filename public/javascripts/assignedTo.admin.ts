import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'
import type { llm } from '@cityssm/llm.js'
import type Sortable from 'sortablejs'

import type { AssignedTo } from '../../types/record.types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: llm
declare const exports: Record<string, unknown>

interface AssignedToExports {
  assignedToList: AssignedTo[]
  userGroups: Array<{ userGroupId: number; userGroupName: string }>
}

const assignedToExports = exports as unknown as AssignedToExports

let assignedToList = assignedToExports.assignedToList
const userGroups = assignedToExports.userGroups

delete assignedToExports.assignedToList
delete assignedToExports.userGroups

function renderAssignedToList(): void {
  const containerElement = document.querySelector(
    '#assignedToItems'
  ) as HTMLTableSectionElement

  if (assignedToList.length === 0) {
    containerElement.innerHTML = `<tr>
      <td class="has-text-centered has-text-grey" colspan="4">
        No items in this list. Click "Add Item" to create one.
      </td>
    </tr>`
    ;(document.querySelector('#itemCount') as HTMLElement).textContent = '0'
    return
  }

  containerElement.innerHTML = ''

  for (const item of assignedToList) {
    const rowElement = document.createElement('tr')
    rowElement.dataset.assignedToId = item.assignedToId.toString()

    const userGroup = userGroups.find(
      (ug) => ug.userGroupId === item.userGroupId
    )

    rowElement.innerHTML = `<td class="has-text-centered">
        <span class="icon is-small has-text-grey handle" style="cursor: move;">
          <i class="fa-solid fa-grip-vertical"></i>
        </span>
      </td>
      <td>
        <span class="item-text">${cityssm.escapeHTML(item.assignedToName)}</span>
      </td>
      <td>
        ${
          userGroup !== undefined
            ? `<span class="tag is-info">${cityssm.escapeHTML(userGroup.userGroupName)}</span>`
            : '<span class="has-text-grey-light">-</span>'
        }
      </td>
      <td class="has-text-right">
        <div class="buttons are-small is-right">
          <button
            class="button is-info button--editItem"
            data-assigned-to-id="${item.assignedToId}"
            data-assigned-to-name="${cityssm.escapeHTML(item.assignedToName)}"
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
            data-assigned-to-id="${item.assignedToId}"
            data-assigned-to-name="${cityssm.escapeHTML(item.assignedToName)}"
            type="button"
          >
            <span class="icon">
              <i class="fa-solid fa-trash"></i>
            </span>
            <span>Delete</span>
          </button>
        </div>
      </td>`

    containerElement.append(rowElement)
  }

  ;(document.querySelector('#itemCount') as HTMLElement).textContent =
    assignedToList.length.toString()

  // Add event listeners
  const editButtons = containerElement.querySelectorAll(
    '.button--editItem'
  ) as NodeListOf<HTMLButtonElement>

  for (const editButton of editButtons) {
    editButton.addEventListener('click', openEditItemModal)
  }

  const deleteButtons = containerElement.querySelectorAll(
    '.button--deleteItem'
  ) as NodeListOf<HTMLButtonElement>

  for (const deleteButton of deleteButtons) {
    deleteButton.addEventListener('click', openDeleteItemModal)
  }
}

function openAddItemModal(): void {
  let addItemFormElement: HTMLFormElement
  let addItemCloseModalFunction: () => void

  function addItem(formEvent: SubmitEvent): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/admin/doAddAssignedToItem`,
      addItemFormElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          assignedToId?: number
          errorMessage?: string
        }

        if (responseJSON.success) {
          assignedToList.push({
            assignedToId: responseJSON.assignedToId as number,
            assignedToName: (addItemFormElement.querySelector('#item--assignedToName') as HTMLInputElement).value,
            userGroupId: (addItemFormElement.querySelector('#item--userGroupId') as HTMLSelectElement).value === '' ? undefined : Number.parseInt((addItemFormElement.querySelector('#item--userGroupId') as HTMLSelectElement).value, 10),
            orderNumber: assignedToList.length
          })

          renderAssignedToList()
          addItemCloseModalFunction()
        } else {
          bulmaJS.alert({
            title: 'Error Adding Item',
            message: responseJSON.errorMessage ?? 'An error occurred.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  const modal = bulmaJS.modal({
    title: 'Add Assigned To Item',
    body: `<form id="form--addItem">
        <div class="field">
          <label class="label" for="item--assignedToName">
            Assigned To Name
            <span class="has-text-danger" title="Required" aria-label="Required">*</span>
          </label>
          <div class="control">
            <input
              class="input"
              id="item--assignedToName"
              name="assignedToName"
              type="text"
              required
              maxlength="200"
            />
          </div>
        </div>
        <div class="field">
          <label class="label" for="item--userGroupId">User Group (Optional)</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select id="item--userGroupId" name="userGroupId">
                <option value="">(All Users)</option>
                ${userGroups
                  .map(
                    (ug) =>
                      `<option value="${ug.userGroupId}">${cityssm.escapeHTML(ug.userGroupName)}</option>`
                  )
                  .join('')}
              </select>
            </div>
          </div>
        </div>
      </form>`,
    buttons: [
      {
        text: 'Add Item',
        colorName: 'primary',
        callbackFunction: () => {
          addItemFormElement.dispatchEvent(new Event('submit'))
        }
      },
      {
        text: 'Cancel',
        colorName: 'light',
        callbackFunction: () => {
          modal.close()
        }
      }
    ]
  })

  addItemCloseModalFunction = modal.close

  addItemFormElement = document.querySelector(
    '#form--addItem'
  ) as HTMLFormElement
  addItemFormElement.addEventListener('submit', addItem)
}

function openEditItemModal(clickEvent: Event): void {
  const buttonElement = clickEvent.currentTarget as HTMLButtonElement

  const assignedToId = Number.parseInt(
    buttonElement.dataset.assignedToId as string,
    10
  )
  const assignedToName = buttonElement.dataset.assignedToName as string
  const userGroupId = buttonElement.dataset.userGroupId as string

  let editItemFormElement: HTMLFormElement
  let editItemCloseModalFunction: () => void

  function editItem(formEvent: SubmitEvent): void {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/admin/doUpdateAssignedToItem`,
      editItemFormElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean }

        if (responseJSON.success) {
          const itemIndex = assignedToList.findIndex(
            (item) => item.assignedToId === assignedToId
          )

          assignedToList[itemIndex].assignedToName = (editItemFormElement.querySelector('#item--assignedToName') as HTMLInputElement).value
          assignedToList[itemIndex].userGroupId = (editItemFormElement.querySelector('#item--userGroupId') as HTMLSelectElement).value === '' ? undefined : Number.parseInt((editItemFormElement.querySelector('#item--userGroupId') as HTMLSelectElement).value, 10)

          renderAssignedToList()
          editItemCloseModalFunction()
        } else {
          bulmaJS.alert({
            title: 'Error Updating Item',
            message: 'An error occurred while updating the item.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  const modal = bulmaJS.modal({
    title: 'Edit Assigned To Item',
    body: `<form id="form--editItem">
        <input type="hidden" name="assignedToId" value="${assignedToId}" />
        <div class="field">
          <label class="label" for="item--assignedToName">
            Assigned To Name
            <span class="has-text-danger" title="Required" aria-label="Required">*</span>
          </label>
          <div class="control">
            <input
              class="input"
              id="item--assignedToName"
              name="assignedToName"
              type="text"
              value="${cityssm.escapeHTML(assignedToName)}"
              required
              maxlength="200"
            />
          </div>
        </div>
        <div class="field">
          <label class="label" for="item--userGroupId">User Group (Optional)</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select id="item--userGroupId" name="userGroupId">
                <option value="" ${userGroupId === '' ? 'selected' : ''}>(All Users)</option>
                ${userGroups
                  .map(
                    (ug) =>
                      `<option value="${ug.userGroupId}" ${ug.userGroupId.toString() === userGroupId ? 'selected' : ''}>${cityssm.escapeHTML(ug.userGroupName)}</option>`
                  )
                  .join('')}
              </select>
            </div>
          </div>
        </div>
      </form>`,
    buttons: [
      {
        text: 'Save Changes',
        colorName: 'primary',
        callbackFunction: () => {
          editItemFormElement.dispatchEvent(new Event('submit'))
        }
      },
      {
        text: 'Cancel',
        colorName: 'light',
        callbackFunction: () => {
          modal.close()
        }
      }
    ]
  })

  editItemCloseModalFunction = modal.close

  editItemFormElement = document.querySelector(
    '#form--editItem'
  ) as HTMLFormElement
  editItemFormElement.addEventListener('submit', editItem)
}

function openDeleteItemModal(clickEvent: Event): void {
  const buttonElement = clickEvent.currentTarget as HTMLButtonElement

  const assignedToId = Number.parseInt(
    buttonElement.dataset.assignedToId as string,
    10
  )
  const assignedToName = buttonElement.dataset.assignedToName as string

  function doDelete(): void {
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/admin/doDeleteAssignedToItem`,
      {
        assignedToId
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean }

        if (responseJSON.success) {
          assignedToList = assignedToList.filter(
            (item) => item.assignedToId !== assignedToId
          )

          renderAssignedToList()
        } else {
          bulmaJS.alert({
            title: 'Error Deleting Item',
            message: 'An error occurred while deleting the item.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  bulmaJS.confirm({
    title: 'Delete Assigned To Item',
    message: `Are you sure you want to delete "${cityssm.escapeHTML(assignedToName)}"?`,
    contextualColorName: 'warning',
    okButton: {
      text: 'Yes, Delete',
      colorName: 'danger',
      callbackFunction: doDelete
    }
  })
}

// Initialize sortable
const containerElement = document.querySelector(
  '#assignedToItems'
) as HTMLTableSectionElement

;(window as unknown as { Sortable: typeof Sortable }).Sortable.create(
  containerElement,
  {
    handle: '.handle',
    animation: 150,
    onSort() {
      const assignedToIds: number[] = []
      const rowElements = containerElement.querySelectorAll('tr')

      for (const rowElement of rowElements) {
        assignedToIds.push(
          Number.parseInt(rowElement.dataset.assignedToId as string, 10)
        )
      }

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doReorderAssignedToItems`,
        {
          assignedToIds
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as { success: boolean }

          if (!responseJSON.success) {
            bulmaJS.alert({
              title: 'Error Reordering Items',
              message: 'An error occurred while reordering the items.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }
  }
)

// Add event listener for add button
document
  .querySelector('.button--addItem')
  ?.addEventListener('click', openAddItemModal)
