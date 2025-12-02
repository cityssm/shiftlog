import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoSearchShiftsResponse } from '../../handlers/shifts-post/doSearchShifts.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog

  const filtersFormElement = document.querySelector(
    '#form--shiftSearch'
  ) as HTMLFormElement

  const offsetInputElement = document.querySelector(
    '#searchSearch--offset'
  ) as HTMLInputElement

  const resultsContainerElement = document.querySelector(
    '#container--shiftSearchResults'
  ) as HTMLDivElement

  function renderShiftsTable(data: DoSearchShiftsResponse): void {
    if (data.shifts.length === 0) {
      resultsContainerElement.innerHTML = /* html */ `
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
          <th>Time</th>
          <th>Supervisor</th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tableBodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const shift of data.shifts) {
      const tableRowElement = document.createElement('tr')

      tableRowElement.innerHTML = /* html */ `
        <td>
          <a href="${shiftLog.buildShiftURL(shift.shiftId)}">
            ${cityssm.escapeHTML(shift.shiftId.toString())}
          </a>
        </td>
        <td>${cityssm.escapeHTML(shift.shiftTypeDataListItem ?? '(Unknown Shift Type)')}</td>
        <td>${cityssm.dateToString(new Date(shift.shiftDate))}</td>
        <td>${cityssm.escapeHTML(shift.shiftTimeDataListItem ?? '(Unknown Shift Time)')}</td>
        <td>
          ${cityssm.escapeHTML(shift.supervisorLastName ?? '')}, ${cityssm.escapeHTML(shift.supervisorFirstName ?? '')}
        </td>
      `

      tableBodyElement.append(tableRowElement)
    }

    resultsContainerElement.replaceChildren(tableElement)

    // Pagination

    resultsContainerElement.append(
      shiftLog.buildPaginationControls({
        totalCount: data.totalCount,
        currentPageOrOffset: data.offset,
        itemsPerPageOrLimit: data.limit,
        clickHandler: (pageNumber) => {
          offsetInputElement.value = ((pageNumber - 1) * data.limit).toString()
          getSearchResults()
        }
      })
    )
  }

  function getSearchResults(): void {
    resultsContainerElement.innerHTML = /* html */ `
      <div class="has-text-centered py-5">
        <span class="icon is-large has-text-grey-lighter">
          <i class="fa-solid fa-spinner fa-pulse fa-2x"></i>
        </span>
      </div>
    `

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/${shiftLog.shiftsRouter}/doSearchShifts`,
      filtersFormElement,
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as unknown as DoSearchShiftsResponse

        renderShiftsTable(responseJSON)
      }
    )
  }

  filtersFormElement.addEventListener('submit', (event) => {
    event.preventDefault()
  })

  const formElements = filtersFormElement.querySelectorAll('input, select')

  for (const formElement of formElements) {
    formElement.addEventListener('change', () => {
      offsetInputElement.value = '0'
      getSearchResults()
    })
  }

  getSearchResults()
})()
