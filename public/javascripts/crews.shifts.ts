/* eslint-disable max-lines -- Large file */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type {
  Crew,
  CrewEquipment,
  CrewMember,
  Employee,
  Equipment,
  UserGroup
} from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

interface CrewWithDetails extends Crew {
  members: CrewMember[]
  equipment: CrewEquipment[]
}

declare const exports: {
  shiftLog: ShiftLogGlobal

  crews: Crew[]
  employees: Employee[]
  equipment: Equipment[]
  userGroups: UserGroup[]
  canManage: boolean
}
;(() => {
  const shiftLog = exports.shiftLog

  const shiftUrlPrefix = `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}`

  const crewsContainerElement = document.querySelector(
    '#container--crews'
  ) as HTMLElement

  function deleteCrew(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const crewId = Number.parseInt(buttonElement.dataset.crewId ?? '', 10)

    const crew = exports.crews.find((c) => c.crewId === crewId)

    if (crew === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Delete Crew',

      message: `Are you sure you want to delete the crew "${cityssm.escapeHTML(crew.crewName)}"? This action cannot be undone.`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Delete Crew',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftUrlPrefix}/doDeleteCrew`,
            {
              crewId
            },
            (responseJSON: {
              success: boolean

              crews?: Crew[]
            }) => {
              if (responseJSON.success) {
                if (responseJSON.crews !== undefined) {
                  exports.crews = responseJSON.crews
                  renderCrews()
                }

                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Crew Deleted',

                  message: 'The crew has been deleted successfully.'
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Crew',

                  message: 'An error occurred while deleting the crew.'
                })
              }
            }
          )
        }
      }
    })
  }

  function openEditCrewModal(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const crewId = Number.parseInt(buttonElement.dataset.crewId ?? '', 10)

    const crew = exports.crews.find((c) => c.crewId === crewId)

    if (crew === undefined) {
      return
    }

    let closeModalFunction: () => void

    cityssm.openHtmlModal('shifts-crews-edit', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector('#crewEdit--crewId') as HTMLInputElement
        ).value = crewId.toString()
        ;(
          modalElement.querySelector('#crewEdit--crewName') as HTMLInputElement
        ).value = crew.crewName
        ;(
          modalElement.querySelector(
            '#crewEdit--userGroupId'
          ) as HTMLSelectElement
        ).value = crew.userGroupId?.toString() ?? ''

        modalElement
          .querySelector('#form--editCrew')
          ?.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault()

            cityssm.postJSON(
              `${shiftUrlPrefix}/doUpdateCrew`,
              formEvent.currentTarget,
              (responseJSON: {
                success: boolean

                crews?: Crew[]
              }) => {
                if (responseJSON.success) {
                  if (responseJSON.crews !== undefined) {
                    exports.crews = responseJSON.crews
                    renderCrews()
                  }

                  closeModalFunction()

                  bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Crew updated successfully.'
                  })
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Crew',

                    message: 'An error occurred while updating the crew.'
                  })
                }
              }
            )
          })
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction
        modalElement
          .querySelector<HTMLInputElement>('#crewEdit--crewName')
          ?.focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteCrewMember(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const crewId = Number.parseInt(buttonElement.dataset.crewId ?? '', 10)
    const employeeNumber = buttonElement.dataset.employeeNumber ?? ''

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Remove Crew Member',

      message: 'Are you sure you want to remove this employee from the crew?',
      okButton: {
        text: 'Remove Member',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftUrlPrefix}/doDeleteCrewMember`,
            {
              crewId,
              employeeNumber
            },
            (responseJSON: {
              success: boolean

              crew?: CrewWithDetails
            }) => {
              if (responseJSON.success && responseJSON.crew !== undefined) {
                const panelElement = document.querySelector(
                  `details[data-crew-id="${crewId}"]`
                ) as HTMLElement | null

                if (panelElement !== null) {
                  renderCrewDetails(crewId, responseJSON.crew, panelElement)
                }
              }
            }
          )
        }
      }
    })
  }

  function openAddCrewMemberModal(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const crewId = Number.parseInt(buttonElement.dataset.crewId ?? '', 10)

    let closeModalFunction: () => void

    cityssm.openHtmlModal('shifts-crews-addMember', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#crewMemberAdd--crewId'
          ) as HTMLInputElement
        ).value = crewId.toString()

        // Populate employee dropdown
        const selectElement = modalElement.querySelector(
          '#crewMemberAdd--employeeNumber'
        ) as HTMLSelectElement

        // Get existing members to exclude them
        cityssm.postJSON(
          `${shiftUrlPrefix}/doGetCrew`,
          { crewId },
          (responseJSON: {
            success: boolean

            crew?: CrewWithDetails
          }) => {
            if (responseJSON.success && responseJSON.crew !== undefined) {
              const existingMemberNumbers = new Set(
                responseJSON.crew.members.map((member) => member.employeeNumber)
              )

              for (const employee of exports.employees) {
                if (!existingMemberNumbers.has(employee.employeeNumber)) {
                  const optionElement = document.createElement('option')
                  optionElement.value = employee.employeeNumber
                  optionElement.textContent = `${employee.lastName}, ${employee.firstName} (${employee.employeeNumber})`
                  selectElement.append(optionElement)
                }
              }
            }
          }
        )

        modalElement
          .querySelector('#form--addCrewMember')
          ?.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault()

            cityssm.postJSON(
              `${shiftUrlPrefix}/doAddCrewMember`,
              formEvent.currentTarget,
              (responseJSON: {
                success: boolean

                crew?: CrewWithDetails
              }) => {
                if (responseJSON.success && responseJSON.crew !== undefined) {
                  const panelElement = document.querySelector(
                    `details[data-crew-id="${crewId}"]`
                  ) as HTMLElement | null

                  if (panelElement !== null) {
                    renderCrewDetails(crewId, responseJSON.crew, panelElement)
                  }
                  closeModalFunction()
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Adding Member',

                    message: 'An error occurred while adding the crew member.'
                  })
                }
              }
            )
          })
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

  function deleteCrewEquipment(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const crewId = Number.parseInt(buttonElement.dataset.crewId ?? '', 10)
    const equipmentNumber = buttonElement.dataset.equipmentNumber ?? ''

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Remove Equipment',

      message: 'Are you sure you want to remove this equipment from the crew?',
      okButton: {
        text: 'Remove Equipment',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftUrlPrefix}/doDeleteCrewEquipment`,
            {
              crewId,
              equipmentNumber
            },
            (responseJSON: {
              success: boolean

              crew?: CrewWithDetails
            }) => {
              if (responseJSON.success && responseJSON.crew !== undefined) {
                const panelElement = document.querySelector(
                  `details[data-crew-id="${crewId}"]`
                ) as HTMLElement | null

                if (panelElement !== null) {
                  renderCrewDetails(crewId, responseJSON.crew, panelElement)
                }
              }
            }
          )
        }
      }
    })
  }

  function updateEquipmentAssignment(changeEvent: Event): void {
    const selectElement = changeEvent.currentTarget as HTMLSelectElement

    const crewId = Number.parseInt(selectElement.dataset.crewId ?? '', 10)
    const equipmentNumber = selectElement.dataset.equipmentNumber ?? ''
    const employeeNumber = selectElement.value
    const previousValue = selectElement.dataset.previousValue ?? ''

    cityssm.postJSON(
      `${shiftUrlPrefix}/doUpdateCrewEquipment`,
      {
        crewId,
        equipmentNumber,
        employeeNumber
      },
      (responseJSON: {
        success: boolean
        message?: string
        crew?: CrewWithDetails
      }) => {
        if (responseJSON.success && responseJSON.crew !== undefined) {
          const panelElement = document.querySelector(
            `details[data-crew-id="${crewId}"]`
          ) as HTMLElement | null

          if (panelElement !== null) {
            renderCrewDetails(crewId, responseJSON.crew, panelElement)
          }
        } else {
          // Revert to previous value
          selectElement.value = previousValue
          // Update the stored previous value to match the reverted state
          selectElement.dataset.previousValue = previousValue

          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Updating Equipment',

            message:
              responseJSON.message ??
              'An error occurred while updating the equipment assignment.'
          })
        }
      }
    )
  }

  function openAddCrewEquipmentModal(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const crewId = Number.parseInt(buttonElement.dataset.crewId ?? '', 10)

    let closeModalFunction: () => void

    cityssm.openHtmlModal('shifts-crews-addEquipment', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#crewEquipmentAdd--crewId'
          ) as HTMLInputElement
        ).value = crewId.toString()

        // Populate equipment dropdown
        const equipmentSelectElement = modalElement.querySelector(
          '#crewEquipmentAdd--equipmentNumber'
        ) as HTMLSelectElement

        // Populate employee dropdown
        const employeeSelectElement = modalElement.querySelector(
          '#crewEquipmentAdd--employeeNumber'
        ) as HTMLSelectElement

        // Get existing equipment to exclude them
        cityssm.postJSON(
          `${shiftUrlPrefix}/doGetCrew`,
          { crewId },
          (responseJSON: {
            success: boolean

            crew?: CrewWithDetails
          }) => {
            if (responseJSON.success && responseJSON.crew !== undefined) {
              const existingEquipmentNumbers = new Set(
                responseJSON.crew.equipment.map(
                  (equipment) => equipment.equipmentNumber
                )
              )

              // Populate equipment
              for (const equipmentItem of exports.equipment) {
                if (
                  !existingEquipmentNumbers.has(equipmentItem.equipmentNumber)
                ) {
                  const optionElement = document.createElement('option')
                  optionElement.value = equipmentItem.equipmentNumber
                  optionElement.textContent = `${equipmentItem.equipmentName} (${equipmentItem.equipmentNumber})`
                  equipmentSelectElement.append(optionElement)
                }
              }

              // Helper function to populate employee dropdown
              const populateEmployeeOptions = (
                members: Array<{
                  employeeNumber: string
                  firstName?: string
                  lastName?: string
                }>,
                eligibleEmployeeNumbers?: Set<string>
              ): void => {
                employeeSelectElement.innerHTML =
                  '<option value="">(Unassigned)</option>'
                for (const member of members) {
                  if (
                    eligibleEmployeeNumbers === undefined ||
                    eligibleEmployeeNumbers.has(member.employeeNumber)
                  ) {
                    const optionElement = document.createElement('option')
                    optionElement.value = member.employeeNumber
                    optionElement.textContent = `${member.lastName}, ${member.firstName}`
                    employeeSelectElement.append(optionElement)
                  }
                }
              }

              // Populate crew members for assignment
              populateEmployeeOptions(responseJSON.crew.members)

              // Add event listener to filter employees when equipment is selected
              equipmentSelectElement.addEventListener('change', () => {
                const selectedEquipment = equipmentSelectElement.value

                if (selectedEquipment === '') {
                  // Reset to all crew members
                  populateEmployeeOptions(responseJSON.crew?.members ?? [])
                } else {
                  // Get eligible employees for the selected equipment
                  cityssm.postJSON(
                    `${shiftUrlPrefix}/doGetEligibleEmployeesForEquipment`,
                    { equipmentNumber: selectedEquipment },
                    (eligibleResponseJSON) => {
                      const eligibleResponse = eligibleResponseJSON as {
                        success: boolean
                        message?: string

                        employees?: Array<{
                          employeeNumber: string
                          firstName: string
                          lastName: string
                        }>
                      }

                      if (
                        eligibleResponse.success &&
                        eligibleResponse.employees !== undefined
                      ) {
                        const eligibleEmployeeNumbers = new Set(
                          eligibleResponse.employees.map(
                            (emp) => emp.employeeNumber
                          )
                        )
                        populateEmployeeOptions(
                          responseJSON.crew?.members ?? [],
                          eligibleEmployeeNumbers
                        )
                      } else {
                        // On error, show all crew members
                        populateEmployeeOptions(
                          responseJSON.crew?.members ?? []
                        )

                        if (eligibleResponse.message) {
                          bulmaJS.alert({
                            contextualColorName: 'warning',
                            title: 'Unable to Filter Employees',

                            message: eligibleResponse.message
                          })
                        }
                      }
                    }
                  )
                }
              })
            }
          }
        )

        modalElement
          .querySelector('#form--addCrewEquipment')
          ?.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault()

            cityssm.postJSON(
              `${shiftUrlPrefix}/doAddCrewEquipment`,
              formEvent.currentTarget,
              (responseJSON: {
                success: boolean
                message?: string
                crew?: CrewWithDetails
              }) => {
                if (responseJSON.success && responseJSON.crew !== undefined) {
                  const panelElement = document.querySelector(
                    `details[data-crew-id="${crewId}"]`
                  ) as HTMLElement | null

                  if (panelElement !== null) {
                    renderCrewDetails(crewId, responseJSON.crew, panelElement)
                  }

                  closeModalFunction()
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Adding Equipment',

                    message:
                      responseJSON.message ??
                      'An error occurred while adding the equipment.'
                  })
                }
              }
            )
          })
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

  function renderCrewDetails(
    crewId: number,
    crew: CrewWithDetails,
    panelElement: HTMLElement
  ): void {
    const detailsElement = panelElement.querySelector(
      '.panel-block-details'
    ) as HTMLElement | null

    if (detailsElement === null) {
      return
    }

    // Clear previous content
    detailsElement.innerHTML = ''

    // Check permissions
    const canEdit =
      exports.canManage || crew.recordCreate_userName === shiftLog.userName

    // Render members section header with Add button
    const membersHeaderBlock = document.createElement('div')
    membersHeaderBlock.className =
      'panel-block is-justify-content-space-between is-align-items-center'

    const membersHeaderStrong = document.createElement('strong')
    membersHeaderStrong.textContent = 'Members'
    membersHeaderBlock.append(membersHeaderStrong)

    if (canEdit) {
      const addMemberButtonsDiv = document.createElement('div')
      addMemberButtonsDiv.className = 'buttons are-small mb-0'

      const addButton = document.createElement('button')
      addButton.className = 'button is-primary'
      addButton.type = 'button'
      addButton.dataset.crewId = crewId.toString()
      addButton.dataset.addMember = ''
      addButton.innerHTML =
        '<span class="icon"><i class="fa-solid fa-plus"></i></span><span>Add Member</span>'
      addButton.addEventListener('click', openAddCrewMemberModal)

      addMemberButtonsDiv.append(addButton)
      membersHeaderBlock.append(addMemberButtonsDiv)
    }

    detailsElement.append(membersHeaderBlock)

    if (crew.members.length === 0) {
      const emptyBlock = document.createElement('div')
      emptyBlock.className = 'panel-block has-text-grey'
      emptyBlock.textContent = 'No members added yet.'
      detailsElement.append(emptyBlock)
    } else {
      for (const member of crew.members) {
        const memberBlock = document.createElement('div')
        memberBlock.className = 'panel-block'

        const icon = document.createElement('span')
        icon.className = 'panel-icon'
        icon.innerHTML = '<i class="fa-solid fa-user"></i>'
        memberBlock.append(icon)

        const nameText = document.createTextNode(
          `${member.lastName ?? ''}, ${member.firstName ?? ''} (${member.employeeNumber})`
        )
        memberBlock.append(nameText)

        if (canEdit) {
          const deleteButton = document.createElement('button')
          deleteButton.className = 'button is-small is-danger ml-auto'
          deleteButton.type = 'button'
          deleteButton.dataset.crewId = crewId.toString()
          deleteButton.dataset.employeeNumber = member.employeeNumber
          deleteButton.dataset.deleteMember = ''
          deleteButton.innerHTML =
            '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>'
          deleteButton.addEventListener('click', deleteCrewMember)
          memberBlock.append(deleteButton)
        }

        detailsElement.append(memberBlock)
      }
    }

    // Render equipment section header with Add button
    const equipmentHeaderBlock = document.createElement('div')
    equipmentHeaderBlock.className =
      'panel-block is-justify-content-space-between is-align-items-center'

    const equipmentHeaderStrong = document.createElement('strong')
    equipmentHeaderStrong.textContent = 'Equipment'
    equipmentHeaderBlock.append(equipmentHeaderStrong)

    if (canEdit) {
      const addEquipmentButtonsDiv = document.createElement('div')
      addEquipmentButtonsDiv.className = 'buttons are-small mb-0'

      const addButton = document.createElement('button')
      addButton.className = 'button is-primary'
      addButton.type = 'button'
      addButton.dataset.crewId = crewId.toString()
      addButton.dataset.addEquipment = ''
      addButton.innerHTML =
        '<span class="icon"><i class="fa-solid fa-plus"></i></span><span>Add Equipment</span>'
      addButton.addEventListener('click', openAddCrewEquipmentModal)

      addEquipmentButtonsDiv.append(addButton)
      equipmentHeaderBlock.append(addEquipmentButtonsDiv)
    }

    detailsElement.append(equipmentHeaderBlock)

    if (crew.equipment.length === 0) {
      const emptyBlock = document.createElement('div')
      emptyBlock.className = 'panel-block has-text-grey'
      emptyBlock.textContent = 'No equipment added yet.'
      detailsElement.append(emptyBlock)
    } else {
      for (const equipmentItem of crew.equipment) {
        const equipmentBlock = document.createElement('div')
        equipmentBlock.className = 'panel-block is-block'

        const columns = document.createElement('div')
        columns.className = 'columns is-mobile is-vcentered'

        const leftColumn = document.createElement('div')
        leftColumn.className = 'column'

        const icon = document.createElement('span')
        icon.className = 'panel-icon'
        icon.innerHTML = '<i class="fa-solid fa-truck"></i>'
        leftColumn.append(icon)

        const equipmentNameText = document.createTextNode(
          `${equipmentItem.equipmentName ?? ''} (${equipmentItem.equipmentNumber})`
        )
        leftColumn.append(equipmentNameText)

        if (canEdit) {
          const fieldDiv = document.createElement('div')
          fieldDiv.className = 'field has-addons mt-2'

          const controlStatic = document.createElement('div')
          controlStatic.className = 'control'
          const staticButton = document.createElement('span')
          staticButton.className = 'button is-small is-static'
          staticButton.textContent = 'Assigned To'
          controlStatic.append(staticButton)
          fieldDiv.append(controlStatic)

          const controlSelect = document.createElement('div')
          controlSelect.className = 'control is-expanded'
          const selectWrapper = document.createElement('div')
          selectWrapper.className = 'select is-small is-fullwidth'
          const select = document.createElement('select')
          select.dataset.crewId = crewId.toString()
          select.dataset.equipmentNumber = equipmentItem.equipmentNumber
          select.dataset.updateAssignment = ''
          select.dataset.previousValue = equipmentItem.employeeNumber ?? ''

          // Helper function to populate the dropdown
          const populateDropdown = (
            eligibleEmployeeNumbers?: Set<string>
          ): void => {
            select.innerHTML = ''

            const unassignedOption = document.createElement('option')
            unassignedOption.value = ''
            unassignedOption.textContent = '(Unassigned)'
            select.append(unassignedOption)

            for (const member of crew.members) {
              // Only add if no restriction or employee is eligible
              if (
                eligibleEmployeeNumbers === undefined ||
                eligibleEmployeeNumbers.has(member.employeeNumber) ||
                member.employeeNumber === equipmentItem.employeeNumber
              ) {
                const option = document.createElement('option')
                option.value = member.employeeNumber
                option.textContent = `${member.lastName ?? ''}, ${member.firstName ?? ''}`
                if (equipmentItem.employeeNumber === member.employeeNumber) {
                  option.selected = true
                }
                select.append(option)
              }
            }
          }

          // If equipment has an employee list, filter the options before showing
          if (
            equipmentItem.employeeListId !== null &&
            equipmentItem.employeeListId !== undefined
          ) {
            // Disable while loading
            select.disabled = true

            // Show loading state
            const loadingOption = document.createElement('option')
            loadingOption.textContent = 'Loading...'
            select.append(loadingOption)

            cityssm.postJSON(
              `${shiftUrlPrefix}/doGetEligibleEmployeesForEquipment`,
              { equipmentNumber: equipmentItem.equipmentNumber },
              (eligibleResponseJSON) => {
                const eligibleResponse = eligibleResponseJSON as {
                  success: boolean
                  employees?: Array<{ employeeNumber: string }>
                }

                if (
                  eligibleResponse.success &&
                  eligibleResponse.employees !== undefined
                ) {
                  const eligibleEmployeeNumbers = new Set(
                    eligibleResponse.employees.map((emp) => emp.employeeNumber)
                  )
                  populateDropdown(eligibleEmployeeNumbers)
                } else {
                  // On error, show all members
                  populateDropdown()
                }

                select.disabled = false
              }
            )
          } else {
            // No employee list restriction, show all members
            populateDropdown()
          }

          select.addEventListener('change', updateEquipmentAssignment)
          selectWrapper.append(select)
          controlSelect.append(selectWrapper)
          fieldDiv.append(controlSelect)
          leftColumn.append(fieldDiv)
        } else if (equipmentItem.employeeNumber !== null) {
          const assignedDiv = document.createElement('div')
          assignedDiv.className = 'is-size-7 has-text-grey mt-1'
          assignedDiv.textContent = `Assigned to: ${equipmentItem.employeeLastName ?? ''}, ${equipmentItem.employeeFirstName ?? ''}`
          leftColumn.append(assignedDiv)
        }

        columns.append(leftColumn)

        if (canEdit) {
          const rightColumn = document.createElement('div')
          rightColumn.className = 'column is-narrow'

          const deleteButton = document.createElement('button')
          deleteButton.className = 'button is-small is-danger'
          deleteButton.type = 'button'
          deleteButton.dataset.crewId = crewId.toString()
          deleteButton.dataset.equipmentNumber = equipmentItem.equipmentNumber
          deleteButton.dataset.deleteEquipment = ''
          deleteButton.innerHTML =
            '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>'
          deleteButton.addEventListener('click', deleteCrewEquipment)

          rightColumn.append(deleteButton)
          columns.append(rightColumn)
        }

        equipmentBlock.append(columns)
        detailsElement.append(equipmentBlock)
      }
    }
  }

  function renderCrews(): void {
    if (exports.crews.length === 0) {
      const messageDiv = document.createElement('div')
      messageDiv.className = 'message is-info'

      const messageBody = document.createElement('div')
      messageBody.className = 'message-body'
      messageBody.textContent = 'No crews have been added yet.'
      messageDiv.append(messageBody)

      crewsContainerElement.innerHTML = ''
      crewsContainerElement.append(messageDiv)

      return
    }

    crewsContainerElement.innerHTML = ''

    for (const crew of exports.crews) {
      const canEdit =
        exports.canManage || crew.recordCreate_userName === shiftLog.userName

      const panelElement = document.createElement('details')
      panelElement.className = 'panel mb-5 collapsable-panel'
      panelElement.dataset.crewId = crew.crewId.toString()

      // Panel heading with summary
      const summaryElement = document.createElement('summary')
      summaryElement.className = 'panel-heading is-clickable'

      const iconText = document.createElement('span')
      iconText.className = 'icon-text'

      const chevronIcon = document.createElement('span')
      chevronIcon.className = 'icon'
      chevronIcon.innerHTML =
        '<i class="fa-solid fa-chevron-right details-chevron"></i>'
      iconText.append(chevronIcon)

      const crewNameSpan = document.createElement('span')
      crewNameSpan.className = 'has-text-weight-semibold mr-2'
      crewNameSpan.textContent = crew.crewName
      iconText.append(crewNameSpan)

      if (crew.userGroupName !== undefined && crew.userGroupName !== null) {
        const userGroupTag = document.createElement('span')
        userGroupTag.className = 'tag is-info'
        userGroupTag.textContent = crew.userGroupName
        iconText.append(userGroupTag)
      }

      summaryElement.append(iconText)
      panelElement.append(summaryElement)

      // Edit/Delete buttons block (shown right below heading)
      if (canEdit) {
        const buttonBlock = document.createElement('div')
        buttonBlock.className = 'panel-block is-justify-content-end'

        const buttonsDiv = document.createElement('div')
        buttonsDiv.className = 'buttons are-small mb-0'

        const editButton = document.createElement('button')
        editButton.className = 'button is-info'
        editButton.type = 'button'
        editButton.dataset.crewId = crew.crewId.toString()
        editButton.dataset.editCrew = ''
        editButton.innerHTML =
          '<span class="icon"><i class="fa-solid fa-pencil"></i></span><span>Edit Crew</span>'
        editButton.addEventListener('click', openEditCrewModal)

        const deleteButton = document.createElement('button')
        deleteButton.className = 'button is-danger'
        deleteButton.type = 'button'
        deleteButton.dataset.crewId = crew.crewId.toString()
        deleteButton.dataset.deleteCrew = ''
        deleteButton.innerHTML =
          '<span class="icon"><i class="fa-solid fa-trash"></i></span><span>Delete Crew</span>'
        deleteButton.addEventListener('click', deleteCrew)

        buttonsDiv.append(editButton, deleteButton)
        buttonBlock.append(buttonsDiv)
        panelElement.append(buttonBlock)
      }

      // Details container
      const detailsDiv = document.createElement('div')
      detailsDiv.className = 'panel-block-details'
      panelElement.append(detailsDiv)

      crewsContainerElement.append(panelElement)

      // Load details when panel is opened
      panelElement.addEventListener('toggle', () => {
        if (panelElement.open) {
          const crewId = Number.parseInt(panelElement.dataset.crewId ?? '', 10)
          cityssm.postJSON(
            `${shiftUrlPrefix}/doGetCrew`,
            { crewId },
            (responseJSON: {
              success: boolean

              crew?: CrewWithDetails
            }) => {
              if (responseJSON.success && responseJSON.crew !== undefined) {
                renderCrewDetails(crewId, responseJSON.crew, panelElement)
              }
            }
          )
        }
      })
    }
  }

  function openAddCrewModal(): void {
    let closeModalFunction: () => void

    cityssm.openHtmlModal('shifts-crews-add', {
      onshow(modalElement) {
        modalElement
          .querySelector('#form--addCrew')
          ?.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault()

            cityssm.postJSON(
              `${shiftUrlPrefix}/doAddCrew`,
              formEvent.currentTarget,
              (responseJSON: {
                success: boolean

                crews?: Crew[]
              }) => {
                if (responseJSON.success) {
                  if (responseJSON.crews !== undefined) {
                    exports.crews = responseJSON.crews
                    renderCrews()
                  }

                  closeModalFunction()

                  bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Crew added successfully.'
                  })
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Adding Crew',

                    message: 'An error occurred while adding the crew.'
                  })
                }
              }
            )
          })
      },
      onshown(modalElement, closeFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = closeFunction
        modalElement
          .querySelector<HTMLInputElement>('#crewAdd--crewName')
          ?.focus()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  // Initialize
  document
    .querySelector('#button--addCrew')
    ?.addEventListener('click', openAddCrewModal)

  renderCrews()
})()
