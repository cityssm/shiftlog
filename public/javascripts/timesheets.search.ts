import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoSearchTimesheetsResponse } from '../../handlers/timesheets-post/doSearchTimesheets.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog

  const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.timesheetsRouter}`

  const formElement = document.querySelector(
    '#form--timesheetSearch'
  ) as HTMLFormElement

  const searchResultsContainerElement = document.querySelector(
    '#container--timesheetSearchResults'
  ) as HTMLElement

  const offsetElement = formElement.querySelector(
    '#timesheetSearch--offset'
  ) as HTMLInputElement

  const currentTimesheetDateString = cityssm.dateToString(new Date())

  function renderTimesheetResults(data: DoSearchTimesheetsResponse): void {
    if (data.timesheets.length === 0) {
      searchResultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No records found.</p>
        </div>
      `

      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'
    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Date</th>
          <th>Title</th>
          <th>Supervisor</th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tableBodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const timesheet of data.timesheets) {
      const timesheetDate =
        typeof timesheet.timesheetDate === 'string'
          ? new Date(timesheet.timesheetDate)
          : timesheet.timesheetDate

      const tableRowElement = document.createElement('tr')

      tableRowElement.innerHTML = /* html */ `
        <td>
          <a href="${exports.shiftLog.buildTimesheetURL(timesheet.timesheetId)}">
            ${cityssm.escapeHTML(timesheet.timesheetId.toString())}
          </a>
        </td>
        <td>${cityssm.escapeHTML(timesheet.timesheetTypeDataListItem ?? '(Unknown Timesheet Type)')}</td>
        <td>${cityssm.dateToString(timesheetDate)}</td>
        <td>${cityssm.escapeHTML(timesheet.timesheetTitle === '' ? '(No Title)' : timesheet.timesheetTitle)}</td>
        <td>
          ${cityssm.escapeHTML(timesheet.supervisorLastName ?? '')}, ${cityssm.escapeHTML(timesheet.supervisorFirstName ?? '')}
        </td>
      `

      tableBodyElement.append(tableRowElement)
    }

    searchResultsContainerElement.replaceChildren(tableElement)

    // Pagination

    searchResultsContainerElement.append(
      shiftLog.buildPaginationControls({
        totalCount: data.totalCount,
        currentPageOrOffset: data.offset,
        itemsPerPageOrLimit: data.limit,
        clickHandler: (pageNumber) => {
          offsetElement.value = ((pageNumber - 1) * data.limit).toString()
          doSearch()
        }
      })
    )
  }

  function doSearch(): void {
    cityssm.postJSON(
      `${urlPrefix}/doSearchTimesheets`,
      formElement,
      (responseJSON: DoSearchTimesheetsResponse) => {
        renderTimesheetResults(responseJSON)
      }
    )
  }

  // Set up search on change
  formElement.addEventListener('change', () => {
    offsetElement.value = '0'
    doSearch()
  })

  // Initial search with current date
  const timesheetDateStringElement = document.createElement('input')
  timesheetDateStringElement.name = 'timesheetDateString'
  timesheetDateStringElement.type = 'hidden'
  timesheetDateStringElement.value = currentTimesheetDateString
  formElement.prepend(timesheetDateStringElement)

  doSearch()
})()
