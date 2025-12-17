/* eslint-disable max-lines */
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
            `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doDeleteCrew`,
            {
              crewId
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                crews?: Crew[]
              }

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
              `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doUpdateCrew`,
              formEvent.currentTarget,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  crews?: Crew[]
                }

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
        closeModalFunction = closeFunction
        modalElement
          .querySelector<HTMLInputElement>('#crewEdit--crewName')
          ?.focus()
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
            `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doDeleteCrewMember`,
            {
              crewId,
              employeeNumber
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                crew?: CrewWithDetails
              }

              if (responseJSON.success && responseJSON.crew !== undefined) {
                renderCrewDetails(crewId, responseJSON.crew)
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
          `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doGetCrew`,
          { crewId },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              crew?: CrewWithDetails
            }

            if (responseJSON.success && responseJSON.crew !== undefined) {
              const existingMemberNumbers = responseJSON.crew.members.map(
                (m) => m.employeeNumber
              )

              for (const employee of exports.employees) {
                if (!existingMemberNumbers.includes(employee.employeeNumber)) {
                  const optionElement = document.createElement('option')
                  optionElement.value = employee.employeeNumber
                  optionElement.textContent = `${employee.lastName}, ${employee.firstName} (${employee.employeeNumber})`
                  selectElement.appendChild(optionElement)
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
              `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doAddCrewMember`,
              formEvent.currentTarget,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  crew?: CrewWithDetails
                }

                if (responseJSON.success && responseJSON.crew !== undefined) {
                  renderCrewDetails(crewId, responseJSON.crew)
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
        closeModalFunction = closeFunction
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
            `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doDeleteCrewEquipment`,
            {
              crewId,
              equipmentNumber
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as {
                success: boolean
                crew?: CrewWithDetails
              }

              if (responseJSON.success && responseJSON.crew !== undefined) {
                renderCrewDetails(crewId, responseJSON.crew)
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

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doUpdateCrewEquipment`,
      {
        crewId,
        equipmentNumber,
        employeeNumber
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          crew?: CrewWithDetails
        }

        if (responseJSON.success && responseJSON.crew !== undefined) {
          renderCrewDetails(crewId, responseJSON.crew)
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
          `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doGetCrew`,
          { crewId },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              crew?: CrewWithDetails
            }

            if (responseJSON.success && responseJSON.crew !== undefined) {
              const existingEquipmentNumbers = responseJSON.crew.equipment.map(
                (e) => e.equipmentNumber
              )

              // Populate equipment
              for (const equipmentItem of exports.equipment) {
                if (
                  !existingEquipmentNumbers.includes(
                    equipmentItem.equipmentNumber
                  )
                ) {
                  const optionElement = document.createElement('option')
                  optionElement.value = equipmentItem.equipmentNumber
                  optionElement.textContent = `${equipmentItem.equipmentName} (${equipmentItem.equipmentNumber})`
                  equipmentSelectElement.append(optionElement)
                }
              }

              // Populate crew members for assignment
              for (const member of responseJSON.crew.members) {
                const optionElement = document.createElement('option')
                optionElement.value = member.employeeNumber
                optionElement.textContent = `${member.lastName}, ${member.firstName}`
                employeeSelectElement.append(optionElement)
              }
            }
          }
        )

        modalElement
          .querySelector('#form--addCrewEquipment')
          ?.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault()

            cityssm.postJSON(
              `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doAddCrewEquipment`,
              formEvent.currentTarget,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  crew?: CrewWithDetails
                }

                if (responseJSON.success && responseJSON.crew !== undefined) {
                  renderCrewDetails(crewId, responseJSON.crew)
                  closeModalFunction()
                } else {
                  bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Adding Equipment',
                    message: 'An error occurred while adding the equipment.'
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

  function renderCrewDetails(crewId: number, crew: CrewWithDetails): void {
    const detailsElement = document.querySelector(
      `#crew-${crewId}--details`
    ) as HTMLElement

    if (detailsElement === null) {
      return
    }

    // Check permissions
    const canEdit =
      exports.canManage || crew.recordCreate_userName === shiftLog.userName

    // Render members
    let membersHTML = '<div class="panel-block"><strong>Members</strong></div>'

    if (crew.members.length === 0) {
      membersHTML +=
        '<div class="panel-block has-text-grey">No members added yet.</div>'
    } else {
      for (const member of crew.members) {
        membersHTML += '<div class="panel-block">'
        membersHTML +=
          '<span class="panel-icon"><i class="fa-solid fa-user"></i></span>'
        membersHTML += `${cityssm.escapeHTML(member.lastName ?? '')}, ${cityssm.escapeHTML(member.firstName ?? '')}`

        if (canEdit) {
          membersHTML += `<button class="button is-small is-danger ml-auto" data-crew-id="${crewId}" data-employee-number="${cityssm.escapeHTML(member.employeeNumber)}" data-delete-member type="button">`
          membersHTML +=
            '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>'
          membersHTML += '</button>'
        }

        membersHTML += '</div>'
      }
    }

    if (canEdit) {
      membersHTML += '<div class="panel-block">'
      membersHTML += `<button class="button is-small is-primary" data-crew-id="${crewId}" data-add-member type="button">`
      membersHTML +=
        '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span>'
      membersHTML += '<span>Add Member</span>'
      membersHTML += '</button>'
      membersHTML += '</div>'
    }

    // Render equipment
    let equipmentHTML =
      '<div class="panel-block"><strong>Equipment</strong></div>'

    if (crew.equipment.length === 0) {
      equipmentHTML +=
        '<div class="panel-block has-text-grey">No equipment added yet.</div>'
    } else {
      for (const equipmentItem of crew.equipment) {
        equipmentHTML += '<div class="panel-block is-block">'
        equipmentHTML += '<div class="columns is-mobile is-vcentered">'
        equipmentHTML += '<div class="column">'
        equipmentHTML +=
          '<span class="panel-icon"><i class="fa-solid fa-truck"></i></span>'
        equipmentHTML += cityssm.escapeHTML(equipmentItem.equipmentName ?? '')

        if (canEdit) {
          equipmentHTML += '<div class="field has-addons mt-2">'
          equipmentHTML += '<div class="control">'
          equipmentHTML +=
            '<span class="button is-small is-static">Assigned To</span>'
          equipmentHTML += '</div>'
          equipmentHTML += '<div class="control is-expanded">'
          equipmentHTML += `<div class="select is-small is-fullwidth"><select data-crew-id="${crewId}" data-equipment-number="${cityssm.escapeHTML(equipmentItem.equipmentNumber)}" data-update-assignment>`
          equipmentHTML += '<option value="">(Unassigned)</option>'

          for (const member of crew.members) {
            equipmentHTML += `<option value="${cityssm.escapeHTML(member.employeeNumber)}"${
              equipmentItem.employeeNumber === member.employeeNumber
                ? ' selected'
                : ''
            }>${cityssm.escapeHTML(member.lastName ?? '')}, ${cityssm.escapeHTML(member.firstName ?? '')}</option>`
          }

          equipmentHTML += '</select></div>'
          equipmentHTML += '</div>'
          equipmentHTML += '</div>'
        } else if (equipmentItem.employeeNumber !== null) {
          equipmentHTML += '<div class="is-size-7 has-text-grey mt-1">'
          equipmentHTML += `Assigned to: ${cityssm.escapeHTML(equipmentItem.employeeLastName ?? '')}, ${cityssm.escapeHTML(equipmentItem.employeeFirstName ?? '')}`
          equipmentHTML += '</div>'
        }

        equipmentHTML += '</div>'

        if (canEdit) {
          equipmentHTML += '<div class="column is-narrow">'
          equipmentHTML += `<button class="button is-small is-danger" data-crew-id="${crewId}" data-equipment-number="${cityssm.escapeHTML(equipmentItem.equipmentNumber)}" data-delete-equipment type="button">`
          equipmentHTML +=
            '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>'
          equipmentHTML += '</button>'
          equipmentHTML += '</div>'
        }

        equipmentHTML += '</div>'
        equipmentHTML += '</div>'
      }
    }

    if (canEdit) {
      equipmentHTML += '<div class="panel-block">'
      equipmentHTML += `<button class="button is-small is-primary" data-crew-id="${crewId}" data-add-equipment type="button">`
      equipmentHTML +=
        '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span>'
      equipmentHTML += '<span>Add Equipment</span>'
      equipmentHTML += '</button>'
      equipmentHTML += '</div>'
    }

    detailsElement.innerHTML = membersHTML + equipmentHTML

    // Add event listeners
    if (canEdit) {
      for (const buttonElement of detailsElement.querySelectorAll(
        '[data-delete-member]'
      )) {
        buttonElement.addEventListener('click', deleteCrewMember)
      }

      for (const buttonElement of detailsElement.querySelectorAll(
        '[data-add-member]'
      )) {
        buttonElement.addEventListener('click', openAddCrewMemberModal)
      }

      for (const buttonElement of detailsElement.querySelectorAll(
        '[data-delete-equipment]'
      )) {
        buttonElement.addEventListener('click', deleteCrewEquipment)
      }

      for (const buttonElement of detailsElement.querySelectorAll(
        '[data-add-equipment]'
      )) {
        buttonElement.addEventListener('click', openAddCrewEquipmentModal)
      }

      for (const selectElement of detailsElement.querySelectorAll(
        '[data-update-assignment]'
      )) {
        selectElement.addEventListener('change', updateEquipmentAssignment)
      }
    }
  }

  function expandCrewPanel(clickEvent: Event): void {
    const linkElement = clickEvent.currentTarget as HTMLAnchorElement
    const crewId = Number.parseInt(linkElement.dataset.crewId ?? '', 10)

    const detailsElement = document.querySelector(
      `#crew-${crewId}--details`
    ) as HTMLElement

    if (detailsElement === null) {
      return
    }

    // Toggle visibility
    if (detailsElement.innerHTML.trim() !== '') {
      detailsElement.innerHTML = ''
      return
    }

    // Load crew details
    cityssm.postJSON(
      `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doGetCrew`,
      { crewId },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          crew?: CrewWithDetails
        }

        if (responseJSON.success && responseJSON.crew !== undefined) {
          renderCrewDetails(crewId, responseJSON.crew)
        }
      }
    )
  }

  function renderCrews(): void {
    if (exports.crews.length === 0) {
      crewsContainerElement.innerHTML =
        '<div class="message is-info"><div class="message-body">No crews have been added yet.</div></div>'
      return
    }

    let crewsHTML = ''

    for (const crew of exports.crews) {
      const canEdit =
        exports.canManage || crew.recordCreate_userName === shiftLog.userName

      crewsHTML += '<nav class="panel mb-4">'
      crewsHTML += `<a class="panel-heading" href="#" data-crew-id="${crew.crewId}" data-expand-crew>`
      crewsHTML += cityssm.escapeHTML(crew.crewName)

      if (crew.userGroupName !== undefined) {
        crewsHTML += ` <span class="tag is-info ml-2">${cityssm.escapeHTML(crew.userGroupName)}</span>`
      }

      crewsHTML += '</a>'
      crewsHTML += `<div id="crew-${crew.crewId}--details"></div>`

      if (canEdit) {
        crewsHTML += '<div class="panel-block">'
        crewsHTML += '<div class="buttons">'
        crewsHTML += `<button class="button is-small" data-crew-id="${crew.crewId}" data-edit-crew type="button">`
        crewsHTML +=
          '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>'
        crewsHTML += '<span>Edit Crew</span>'
        crewsHTML += '</button>'
        crewsHTML += `<button class="button is-small is-danger" data-crew-id="${crew.crewId}" data-delete-crew type="button">`
        crewsHTML +=
          '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>'
        crewsHTML += '<span>Delete Crew</span>'
        crewsHTML += '</button>'
        crewsHTML += '</div>'
        crewsHTML += '</div>'
      }

      crewsHTML += '</nav>'
    }

    crewsContainerElement.innerHTML = crewsHTML

    // Add event listeners
    for (const linkElement of crewsContainerElement.querySelectorAll(
      '[data-expand-crew]'
    )) {
      linkElement.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault()
        expandCrewPanel(clickEvent)
      })
    }

    for (const buttonElement of crewsContainerElement.querySelectorAll(
      '[data-edit-crew]'
    )) {
      buttonElement.addEventListener('click', openEditCrewModal)
    }

    for (const buttonElement of crewsContainerElement.querySelectorAll(
      '[data-delete-crew]'
    )) {
      buttonElement.addEventListener('click', deleteCrew)
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
              `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doAddCrew`,
              formEvent.currentTarget,
              (rawResponseJSON) => {
                const responseJSON = rawResponseJSON as {
                  success: boolean
                  crews?: Crew[]
                }

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
        closeModalFunction = closeFunction
        modalElement
          .querySelector<HTMLInputElement>('#crewAdd--crewName')
          ?.focus()
      }
    })
  }

  // Initialize
  document
    .querySelector('#button--addCrew')
    ?.addEventListener('click', openAddCrewModal)

  renderCrews()
})()
