import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoAddWorkOrderEquipmentResponse } from '../../handlers/workOrders-post/doAddWorkOrderEquipment.js'
import type { DoDeleteWorkOrderEquipmentResponse } from '../../handlers/workOrders-post/doDeleteWorkOrderEquipment.js'
import type { DoGetWorkOrderEquipmentResponse } from '../../handlers/workOrders-post/doGetWorkOrderEquipment.js'
import type { DoUpdateWorkOrderEquipmentNoteResponse } from '../../handlers/workOrders-post/doUpdateWorkOrderEquipmentNote.js'
import type { WorkOrderEquipment } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const exports: {
  shiftLog: ShiftLogGlobal

  isEdit: boolean
}

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
;(() => {
  const workOrderFormElement = document.querySelector(
    '#form--workOrder'
  ) as HTMLFormElement | null

  const workOrderId =
    workOrderFormElement === null
      ? ''
      : (
          workOrderFormElement.querySelector(
            '#workOrder--workOrderId'
          ) as HTMLInputElement
        ).value

  const equipmentContainerElement = document.querySelector(
    '#container--equipment'
  ) as HTMLElement

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (equipmentContainerElement === null) {
    return
  }

  let availableEquipment: DoGetWorkOrderEquipmentResponse['availableEquipment'] =
    []

  function renderEquipment(workOrderEquipment: WorkOrderEquipment[]): void {
    const equipmentCountElement = document.querySelector('#equipmentCount')

    if (equipmentCountElement !== null) {
      equipmentCountElement.textContent = workOrderEquipment.length.toString()
    }

    if (workOrderEquipment.length === 0) {
      equipmentContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No equipment has been added yet.</p>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    // eslint-disable-next-line no-unsanitized/property
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th class="has-width-1"></th>
          <th>Equipment</th>
          <th>Note</th>
          ${exports.isEdit ? '<th class="is-hidden-print"></th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tableBodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const equipment of workOrderEquipment) {
      const tableRowElement = document.createElement('tr')

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td>
          <span class="icon">
            <i class="fa-solid fa-${equipment.equipmentTypeIconClass ?? ''}" style="color: #${equipment.equipmentTypeColorHex ?? '000000'};"></i>
          </span>
        </td>
        <td>
          <a class="has-text-weight-semibold view-equipment" href="#">${cityssm.escapeHTML(equipment.equipmentName ?? '')}</a><br />
          <div class="is-size-7 has-text-grey">
            ${cityssm.escapeHTML(equipment.equipmentNumber)}
          </div>
        </td>
        <td>${cityssm.escapeHTML(equipment.workOrderEquipmentNote)}</td>
        ${
          exports.isEdit
            ? /* html */ `
              <td class="is-hidden-print is-nowrap" style="width: 120px;">
                <div class="buttons are-small is-justify-content-end">
                  <button
                    class="button edit-equipment-note"
                    data-equipment-number="${equipment.equipmentNumber}"
                    type="button"
                    title="Edit Note"
                  >
                    <span class="icon"><i class="fa-solid fa-edit"></i></span>
                  </button>
                  <button
                    class="button is-danger is-light delete-equipment"
                    data-equipment-number="${equipment.equipmentNumber}"
                    type="button"
                    title="Delete"
                  >
                    <span class="icon"><i class="fa-solid fa-trash"></i></span>
                  </button>
                </div>
              </td>
            `
            : ''
        }
      `

      const viewButton = tableRowElement.querySelector(
        '.view-equipment'
      ) as HTMLButtonElement

      viewButton.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault()
        showViewEquipmentModal(equipment)
      })

      if (exports.isEdit) {
        const editButton = tableRowElement.querySelector(
          '.edit-equipment-note'
        ) as HTMLButtonElement

        editButton.addEventListener('click', () => {
          showEditEquipmentNoteModal(equipment)
        })

        const deleteButton = tableRowElement.querySelector(
          '.delete-equipment'
        ) as HTMLButtonElement

        deleteButton.addEventListener('click', () => {
          deleteEquipment(equipment.equipmentNumber)
        })
      }

      tableBodyElement.append(tableRowElement)
    }

    equipmentContainerElement.replaceChildren(tableElement)
  }

  function loadEquipment(): void {
    cityssm.postJSON(
      `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderEquipment`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as DoGetWorkOrderEquipmentResponse
        availableEquipment = responseJSON.availableEquipment
        renderEquipment(responseJSON.workOrderEquipment)
      }
    )
  }

  function showViewEquipmentModal(equipment: WorkOrderEquipment): void {
    cityssm.openHtmlModal('workOrders-viewEquipment', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#viewWorkOrderEquipment--equipmentName'
          ) as HTMLElement
        ).textContent = equipment.equipmentName ?? ''
        ;(
          modalElement.querySelector(
            '#viewWorkOrderEquipment--equipmentNumber'
          ) as HTMLElement
        ).textContent = equipment.equipmentNumber

        const typeContainer = modalElement.querySelector(
          '#viewWorkOrderEquipment--equipmentTypeContainer'
        ) as HTMLElement

        const hasType =
          equipment.equipmentTypeDataListItem !== undefined &&
          equipment.equipmentTypeDataListItem !== ''

        if (hasType) {
          ;(
            modalElement.querySelector(
              // eslint-disable-next-line no-secrets/no-secrets
              '#viewWorkOrderEquipment--equipmentTypeDataListItem'
            ) as HTMLElement
          ).textContent = equipment.equipmentTypeDataListItem ?? ''
        }

        typeContainer.style.display = hasType ? 'block' : 'none'

        const descriptionContainer = modalElement.querySelector(
          '#viewWorkOrderEquipment--descriptionContainer'
        ) as HTMLElement

        const hasDescription =
          equipment.equipmentDescription !== undefined &&
          equipment.equipmentDescription !== ''

        if (hasDescription) {
          ;(
            modalElement.querySelector(
              '#viewWorkOrderEquipment--equipmentDescription'
            ) as HTMLElement
          ).textContent = equipment.equipmentDescription ?? ''
        }

        descriptionContainer.style.display = hasDescription ? 'block' : 'none'

        const noteContainer = modalElement.querySelector(
          '#viewWorkOrderEquipment--noteContainer'
        ) as HTMLElement

        const hasNote = equipment.workOrderEquipmentNote !== ''

        if (hasNote) {
          ;(
            modalElement.querySelector(
              '#viewWorkOrderEquipment--workOrderEquipmentNote'
            ) as HTMLElement
          ).textContent = equipment.workOrderEquipmentNote
        }

        noteContainer.style.display = hasNote ? 'block' : 'none'
      },
      onshown(_modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function showAddEquipmentModal(clickEvent?: Event): void {
    clickEvent?.preventDefault()

    let closeModalFunction: () => void

    function doAddEquipment(submitEvent: Event): void {
      submitEvent.preventDefault()
      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderEquipment`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON =
            rawResponseJSON as DoAddWorkOrderEquipmentResponse

          if (responseJSON.success) {
            closeModalFunction()
            formElement.reset()
            loadEquipment()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Adding Equipment',

              message:
                responseJSON.errorMessage ??
                'An error occurred while adding equipment to this work order.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('workOrders-addEquipment', {
      onshow(modalElement) {
        exports.shiftLog.setUnsavedChanges('modal')
        ;(
          modalElement.querySelector(
            '#addWorkOrderEquipment--workOrderId'
          ) as HTMLInputElement
        ).value = workOrderId

        const equipmentSelectElement = modalElement.querySelector(
          '#addWorkOrderEquipment--equipmentNumber'
        ) as HTMLSelectElement

        equipmentSelectElement.innerHTML =
          '<option value="">(Select Equipment)</option>'

        for (const equipment of availableEquipment) {
          equipmentSelectElement.append(
            new Option(
              `${equipment.equipmentName} (${equipment.equipmentNumber})`,
              equipment.equipmentNumber
            )
          )
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
            '#addWorkOrderEquipment--equipmentNumber'
          ) as HTMLSelectElement
        ).focus()
      },

      onremoved() {
        exports.shiftLog.clearUnsavedChanges('modal')
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function showEditEquipmentNoteModal(equipment: WorkOrderEquipment): void {
    let closeModalFunction: () => void

    function doUpdateEquipmentNote(submitEvent: Event): void {
      submitEvent.preventDefault()
      const formElement = submitEvent.currentTarget as HTMLFormElement

      cityssm.postJSON(
        `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderEquipmentNote`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON =
            rawResponseJSON as DoUpdateWorkOrderEquipmentNoteResponse
          if (responseJSON.success) {
            closeModalFunction()
            loadEquipment()
          } else {
            bulmaJS.alert({
              contextualColorName: 'danger',
              title: 'Error Updating Note',

              message:
                responseJSON.errorMessage ??
                'An error occurred while updating the equipment note.'
            })
          }
        }
      )
    }

    cityssm.openHtmlModal('workOrders-editEquipmentNote', {
      onshow(modalElement) {
        exports.shiftLog.setUnsavedChanges('modal')
        ;(
          modalElement.querySelector(
            '#editWorkOrderEquipmentNote--workOrderId'
          ) as HTMLInputElement
        ).value = workOrderId
        ;(
          modalElement.querySelector(
            '#editWorkOrderEquipmentNote--equipmentNumber'
          ) as HTMLInputElement
        ).value = equipment.equipmentNumber
        ;(
          modalElement.querySelector(
            '#editWorkOrderEquipmentNote--workOrderEquipmentNote'
          ) as HTMLTextAreaElement
        ).value = equipment.workOrderEquipmentNote
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        closeModalFunction = _closeModalFunction
        modalElement
          .querySelector('form')
          ?.addEventListener('submit', doUpdateEquipmentNote)
        ;(
          modalElement.querySelector(
            '#editWorkOrderEquipmentNote--workOrderEquipmentNote'
          ) as HTMLTextAreaElement
        ).focus()
      },

      onremoved() {
        exports.shiftLog.clearUnsavedChanges('modal')
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function deleteEquipment(equipmentNumber: string): void {
    bulmaJS.confirm({
      contextualColorName: 'danger',
      title: 'Delete Equipment',

      message: 'Are you sure you want to remove this equipment?',

      okButton: {
        text: 'Delete',

        callbackFunction() {
          cityssm.postJSON(
            `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderEquipment`,
            {
              equipmentNumber,
              workOrderId: Number.parseInt(workOrderId, 10)
            },
            (rawResponseJSON) => {
              const responseJSON =
                rawResponseJSON as DoDeleteWorkOrderEquipmentResponse

              if (responseJSON.success) {
                loadEquipment()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Deleting Equipment',

                  message:
                    responseJSON.errorMessage ??
                    'An error occurred while deleting the equipment.'
                })
              }
            }
          )
        }
      }
    })
  }

  document
    .querySelector('#button--addEquipment')
    ?.addEventListener('click', showAddEquipmentModal)

  loadEquipment()
})()
