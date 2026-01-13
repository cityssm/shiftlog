(() => {
  const shiftLog = exports.shiftLog
  let assignedToList = exports.assignedToList

  const tbodyElement = document.querySelector(
    '#tbody--assignedTo'
  )

  function renderAssignedToList() {
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

  function addAssignedTo() {
    let closeModalFunction

    function doAddAssignedTo(submitEvent) {
      submitEvent.preventDefault()

      const addForm = submitEvent.currentTarget

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doAddAssignedToItem`,
        addForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON

          if (responseJSON.success && responseJSON.assignedToId) {
            assignedToList.push({
              assignedToId: responseJSON.assignedToId,
              assignedToName: (
                addForm.querySelector(
                  '#addAssignedTo--assignedToName'
                )
              ).value,
              userGroupId:
                (
                  addForm.querySelector(
                    '#addAssignedTo--userGroupId'
                  )
                ).value === ''
                  ? undefined
                  : Number.parseInt(
                      (
                        addForm.querySelector(
                          '#addAssignedTo--userGroupId'
                        )
                      ).value,
                      10
                    ),
              orderNumber: assignedToList.length
            })

            renderAssignedToList()
            closeModalFunction()
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

    cityssm.openHtmlModal('adminAssignedTo-add', {
      onshow(modalElement) {
        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#addAssignedTo--userGroupId'
        )

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
          )
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function editAssignedTo(clickEvent) {
    const buttonElement = clickEvent.currentTarget
    const assignedToId = buttonElement.dataset.assignedToId
    const currentAssignedToName = buttonElement.dataset.assignedToName
    const currentUserGroupId = buttonElement.dataset.userGroupId

    if (assignedToId === undefined || currentAssignedToName === undefined) {
      return
    }

    let closeModalFunction

    function doUpdateAssignedTo(submitEvent) {
      submitEvent.preventDefault()

      const editForm = submitEvent.currentTarget

      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doUpdateAssignedToItem`,
        editForm,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON

          if (responseJSON.success) {
            const itemIndex = assignedToList.findIndex(
              (item) =>
                assignedToId !== undefined &&
                item.assignedToId === Number.parseInt(assignedToId, 10)
            )

            if (itemIndex >= 0) {
              assignedToList[itemIndex].assignedToName = (
                editForm.querySelector(
                  '#editAssignedTo--assignedToName'
                )
              ).value
              assignedToList[itemIndex].userGroupId =
                (
                  editForm.querySelector(
                    '#editAssignedTo--userGroupId'
                  )
                ).value === ''
                  ? undefined
                  : Number.parseInt(
                      (
                        editForm.querySelector(
                          '#editAssignedTo--userGroupId'
                        )
                      ).value,
                      10
                    )
            }

            renderAssignedToList()
            closeModalFunction()
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

    cityssm.openHtmlModal('adminAssignedTo-edit', {
      onshow(modalElement) {
        // Set current values
        ;(
          modalElement.querySelector(
            '#editAssignedTo--assignedToId'
          )
        ).value = assignedToId
        ;(
          modalElement.querySelector(
            '#editAssignedTo--assignedToName'
          )
        ).value = currentAssignedToName

        // Populate user group options
        const userGroupSelect = modalElement.querySelector(
          '#editAssignedTo--userGroupId'
        )

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
          )
        ).focus()
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteAssignedTo(clickEvent) {
    const buttonElement = clickEvent.currentTarget

    const assignedToId = Number.parseInt(
      buttonElement.dataset.assignedToId,
      10
    )
    const assignedToName = buttonElement.dataset.assignedToName

    function doDelete() {
      cityssm.postJSON(
        `${shiftLog.urlPrefix}/admin/doDeleteAssignedToItem`,
        {
          assignedToId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON

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
  Sortable.create(tbodyElement, {
    handle: '.handle',
    animation: 150,
    onEnd() {
      const assignedToIds = []
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
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON

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
  })

  // Add event listener for add button
  document
    .querySelector('#button--addAssignedTo')
    ?.addEventListener('click', addAssignedTo)
})()
