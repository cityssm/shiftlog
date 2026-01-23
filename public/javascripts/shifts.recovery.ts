import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Shift } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const resultsContainerElement = document.querySelector(
    '#container--deletedRecordResults'
  ) as HTMLDivElement

  function recoverShift(shiftId: number): void {
    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Recover Shift?',

      message: 'Are you sure you want to recover this shift?',
      okButton: {
        text: 'Yes, Recover',

        callbackFunction: () => {
          cityssm.postJSON(
            `${exports.shiftLog.urlPrefix}/${exports.shiftLog.shiftsRouter}/doRecoverShift`,
            { shiftId },
            (response: {
              success: boolean
              message?: string
              redirectUrl?: string
              errorMessage?: string
            }) => {
              if (response.success) {
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Shift Recovered',

                  message: 'The shift has been recovered successfully.',
                  okButton: {
                    callbackFunction: () => {
                      globalThis.location.href = response.redirectUrl as string
                    }
                  }
                })
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error',

                  message: response.errorMessage ?? 'Failed to recover shift.'
                })
              }
            }
          )
        }
      }
    })
  }

  function renderDeletedRecordsTable(data: {
    success: boolean
    shifts: Shift[]
  }): void {
    if (data.shifts.length === 0) {
      resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No deleted records found.</p>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className =
      'table is-fullwidth is-striped is-hoverable is-narrow'

    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Type</th>
          <th>Details</th>
          <th>Deleted By</th>
          <th>Deleted Date</th>
          <th class="has-width-1">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tableBodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const shift of data.shifts) {
      const tableRowElement = document.createElement('tr')

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td>
          ${cityssm.dateToString(new Date(shift.shiftDate))}
        </td>
        <td>${cityssm.escapeHTML(shift.shiftTimeDataListItem ?? '-')}</td>
        <td>${cityssm.escapeHTML(shift.shiftTypeDataListItem ?? '-')}</td>
        <td>${cityssm.escapeHTML(shift.shiftDescription.slice(0, 100))}${shift.shiftDescription.length > 100 ? '...' : ''}</td>
        <td>${cityssm.escapeHTML(shift.recordDelete_userName ?? '')}</td>
        <td>
          ${shift.recordDelete_dateTime ? cityssm.dateToString(new Date(shift.recordDelete_dateTime)) : ''}
        </td>
        <td>
          <button
            class="button is-small is-primary is-light"
            data-shift-id="${shift.shiftId}"
            type="button"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-undo"></i>
            </span>
            <span>Recover</span>
          </button>
        </td>
      `

      const recoverButton = tableRowElement.querySelector(
        'button'
      ) as HTMLButtonElement

      recoverButton.addEventListener('click', () => {
        recoverShift(shift.shiftId)
      })

      tableBodyElement.append(tableRowElement)
    }

    resultsContainerElement.innerHTML = ''
    resultsContainerElement.append(tableElement)
  }

  function getDeletedRecords(): void {
    resultsContainerElement.innerHTML = /* html */ `
      <div class="message">
        <p class="message-body has-text-centered">
          <span class="icon"><i class="fa-solid fa-spinner fa-spin"></i></span>
          <span>Loading...</span>
        </p>
      </div>
    `

    cityssm.postJSON(
      `${exports.shiftLog.urlPrefix}/${exports.shiftLog.shiftsRouter}/doGetDeletedShifts`,
      {},
      renderDeletedRecordsTable
    )
  }

  getDeletedRecords()
})()
