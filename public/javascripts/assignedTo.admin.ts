import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { AssignedTo } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const Sortable: {
  create: (
    element: HTMLElement,
    options: {
      animation: number
      handle: string
      onEnd: () => void
    }
  ) => void
}

interface UserGroup {
  userGroupId: number
  userGroupName: string
}

declare const exports: {
  assignedToList: AssignedTo[]
  shiftLog: ShiftLogGlobal
  userGroups: UserGroup[]
}
;(() => {
  const shiftLog = exports.shiftLog
  let assignedToList = exports.assignedToList

  const tbodyElement = document.querySelector(
    '#tbody--assignedTo'
  ) as HTMLElement

  function renderAssignedToList(): void {
    if (assignedToList.length === 0) {
      tbodyElement.innerHTML = `<tr id="tr--noAssignedTo">
        <td colspan="4" class="has-text-centered has-text-grey">
          No assigned to items found. Click "Add Assigned To Item" to create one.
        </td>
      </tr>`
      return
    }

    // Clear existing
    tbodyElement.innerHTML = ''

    for (const item of assignedToList) {
      const userGroup = exports.userGroups.find(
        (ug) => ug.userGroupId === item.userGroupId
      )
      const userGroupDisplay =
        userGroup === undefined
          ? '<span class="has-text-grey-light">-</span>'
          : `<span class="tag is-info">${cityssm.escapeHTML(userGroup.userGroupName)}</span>`

      const rowElement = document.createElement('tr')

      rowElement.dataset.assignedToId = item.assignedToId.toString()

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = /* html */ `
        <td class="has-text-centered">
          <span class="icon is-small has-text-grey handle" style="cursor: move;">
            <i class="fa-solid fa-grip-vertical"></i>
          </span>
        </td>
        <td>
          <span class="assigned-to-name">
            ${cityssm.escapeHTML(item.assignedToName)}
          </span>
        </td>
        <td>
          ${userGroupDisplay}
        </td>
        <td class="has-text-right">
          <div class="buttons are-small is-right">
            <button
              class="button is-info button--editAssignedTo"
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
              class="button is-danger button--deleteAssignedTo"
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
        </td>
      `

      rowElement
        .querySelector('.button--editAssignedTo')
        ?.addEventListener('click', editAssignedTo)

      rowElement
        .querySelector('.button--deleteAssignedTo')
        ?.addEventListener('click', deleteAssignedTo)

      tbodyElement.append(rowElement)
    }
  }

  function addAssignedTo(): void {
    let closeModalFunction: () => void

    function doAddAssignedTo(submitEvent: Event): void {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddAssignedToItem`,
        addForm,
        (responseJSON: {
          success: boolean

          errorMessage?: string

          assignedToId?: number
        }) => {
          if (responseJSON.success && responseJSON.assignedToId) {
            assignedToList.push({
              assignedToId: responseJSON.assignedToId,
              assignedToName: (
                addForm.querySelector(
                  '#addAssignedTo--assignedToName'
                ) as HTMLInputElement
              ).value,
              userGroupId:
                (
                  addForm.querySelector(
                    '#addAssignedTo--userGroupId'
                  ) as HTMLSelectElement
                ).value === ''
                  ? undefined
                  : Number.parseInt(
                      (
                        addForm.querySelector(
                          '#addAssignedTo--userGroupId'
                        ) as HTMLSelectElement
                      ).value,
                      10
                    ),
              orderNumber: assignedToList.length
            })

            renderAssignedToList()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Item',

              message: responseJSON.errorMessage ?? 'An error occurred.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminAssignedTo-add', {
      onshow(modalElement) {
        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#addAssignedTo--userGroupId'
        ) as HTMLSelectElement

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
          ?.addEventListener('submit', doAddAssignedTo)
        ;(
          modalElement.querySelector(
            '#addAssignedTo--assignedToName'
          ) as HTMLInputElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function editAssignedTo(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const assignedToId = buttonElement.dataset.assignedToId
    const currentAssignedToName = buttonElement.dataset.assignedToName
    const currentUserGroupId = buttonElement.dataset.userGroupId

    if (assignedToId === undefined || currentAssignedToName === undefined) {
      return
    }

    let closeModalFunction: () => void

    function doUpdateAssignedTo(submitEvent: Event): void {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateAssignedToItem`,
        editForm,
        (responseJSON: { success: boolean }) => {
          if (responseJSON.success) {
            const itemIndex = assignedToList.findIndex(
              (item) =>
                assignedToId !== undefined &&
                item.assignedToId === Number.parseInt(assignedToId, 10)
            )

            if (itemIndex !== -1) {
              assignedToList[itemIndex].assignedToName = (
                editForm.querySelector(
                  '#editAssignedTo--assignedToName'
                ) as HTMLInputElement
              ).value

              assignedToList[itemIndex].userGroupId =
                (
                  editForm.querySelector(
                    '#editAssignedTo--userGroupId'
                  ) as HTMLSelectElement
                ).value === ''
                  ? undefined
                  : Number.parseInt(
                      (
                        editForm.querySelector(
                          '#editAssignedTo--userGroupId'
                        ) as HTMLSelectElement
                      ).value,
                      10
                    )
            }

            renderAssignedToList()
            closeModalFunction()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Item',

              message: 'An error occurred while updating the item.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('adminAssignedTo-edit', {
      onshow(modalElement) {
        // Set current values
        ;(
          modalElement.querySelector(
            '#editAssignedTo--assignedToId'
          ) as HTMLInputElement
        ).value = assignedToId
        ;(
          modalElement.querySelector(
            '#editAssignedTo--assignedToName'
          ) as HTMLInputElement
        ).value = currentAssignedToName

        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#editAssignedTo--userGroupId'
        ) as HTMLSelectElement

        for (const userGroup of exports.userGroups) {
          const option = document.createElement('option')
          option.value = userGroup.userGroupId.toString()
          option.textContent = userGroup.userGroupName
          if (
            currentUserGroupId !== undefined &&
            currentUserGroupId !== '' &&
            userGroup.userGroupId === Number.parseInt(currentUserGroupId, 10)
          ) {
            option.selected = true
          }
          userGroupSelect.append(option)
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateAssignedTo)
        ;(
          modalElement.querySelector(
            '#editAssignedTo--assignedToName'
          ) as HTMLInputElement
        ).focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteAssignedTo(clickEvent: Event): void {
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
        (responseJSON: { success: boolean }) => {
          if (responseJSON.success) {
            assignedToList = assignedToList.filter(
              (item) => item.assignedToId !== assignedToId
            )

            renderAssignedToList()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Deleting Item',

              message: 'An error occurred while deleting the item.'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Assigned To Item',

      message: `Are you sure you want to delete "${cityssm.escapeHTML(assignedToName)}"?`,
      okButton: {
        callbackFunction: doDelete,
        text: 'Yes, Delete'
      }
    })
  }

  // Initialize sortable
  Sortable.create(tbodyElement, {
    handle: '.handle',
    animation: 150,
    onEnd() {
      const assignedToIds: number[] = []
      const rowElements = tbodyElement.querySelectorAll('tr')

      for (const rowElement of rowElements) {
        if (rowElement.dataset.assignedToId !== undefined) {
          assignedToIds.push(
            Number.parseInt(rowElement.dataset.assignedToId, 10)
          )
        }
      }

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doReorderAssignedToItems`,
        {
          assignedToIds
        },
        (responseJSON: { success: boolean }) => {
          if (!responseJSON.success) {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Reordering Items',

              message: 'An error occurred while reordering the items.'
            })
          }
        }
      )
    }
  })

  // Add event listener for add button
  document
    .querySelector('#button--addAssignedTo')
    ?.addEventListener('click', addAssignedTo)
})()
