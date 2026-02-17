import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoRecoverTimesheetResponse } from '../../handlers/timesheets-post/doRecoverTimesheet.js'
import type { Timesheet } from '../../types/record.types.js'

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

  function recoverTimesheet(timesheetId: number): void {
    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Recover Timesheet?',

      message: 'Are you sure you want to recover this timesheet?',
      okButton: {
        text: 'Yes, Recover',

        callbackFunction: () => {
          cityssm.postJSON(
            `${exports.shiftLog.urlPrefix}/${exports.shiftLog.timesheetsRouter}/doRecoverTimesheet`,
            { timesheetId },
            (response: DoRecoverTimesheetResponse) => {
              if (response.success) {
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'Timesheet Recovered',

                  message: 'The timesheet has been recovered successfully.',
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

                  message:
                    response.errorMessage === ''
                      ? 'Failed to recover timesheet.'
                      : response.errorMessage
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
    timesheets: Timesheet[]
  }): void {
    if (data.timesheets.length === 0) {
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
          <th>Type</th>
          <th>Supervisor</th>
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

    for (const timesheet of data.timesheets) {
      const tableRowElement = document.createElement('tr')

      const supervisorName =
        timesheet.supervisorLastName || timesheet.supervisorFirstName
          ? `${timesheet.supervisorLastName ?? ''}, ${timesheet.supervisorFirstName ?? ''}`
          : (timesheet.supervisorEmployeeNumber ?? '-')

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td>
          ${cityssm.dateToString(new Date(timesheet.timesheetDate))}
        </td>
        <td>${cityssm.escapeHTML(timesheet.timesheetTypeDataListItem ?? '-')}</td>
        <td>${cityssm.escapeHTML(supervisorName)}</td>
        <td>${cityssm.escapeHTML((timesheet.timesheetDetails ?? '').slice(0, 100))}${(timesheet.timesheetDetails ?? '').length > 100 ? '...' : ''}</td>
        <td>${cityssm.escapeHTML(timesheet.recordDelete_userName ?? '')}</td>
        <td>
          ${timesheet.recordDelete_dateTime ? cityssm.dateToString(new Date(timesheet.recordDelete_dateTime)) : ''}
        </td>
        <td>
          <button
            class="button is-small is-primary is-light"
            data-timesheet-id="${timesheet.timesheetId}"
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
        recoverTimesheet(timesheet.timesheetId)
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
      `${exports.shiftLog.urlPrefix}/${exports.shiftLog.timesheetsRouter}/doGetDeletedTimesheets`,
      {},
      renderDeletedRecordsTable
    )
  }

  getDeletedRecords()
})()
