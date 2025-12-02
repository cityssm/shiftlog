import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoSearchWorkOrdersResponse } from '../../handlers/workOrders-post/doSearchWorkOrders.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog

  const filtersFormElement = document.querySelector(
    '#form--workOrderSearch'
  ) as HTMLFormElement

  const offsetInputElement = document.querySelector(
    '#workOrderSearch--offset'
  ) as HTMLInputElement

  const resultsContainerElement = document.querySelector(
    '#container--workOrderSearchResults'
  ) as HTMLDivElement

  function renderWorkOrdersTable(data: DoSearchWorkOrdersResponse): void {
    if (data.workOrders.length === 0) {
      resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No records found.</p>
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
          <th class="has-width-1">
            <span class="is-sr-only">Open / Closed</span>
          </th>
          <th>Number</th>
          <th>Location</th>
          <th>Status</th>
          <th>Open Date</th>
          <th>Requestor</th>
          <th>Assigned To</th>
          <th class="has-width-1 is-hidden-print">
            <span class="is-sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    const tableBodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const workOrder of data.workOrders) {
      const tableRowElement = document.createElement('tr')

      let openClosedIconHTML =
        '<span class="icon has-text-success" title="Open"><i class="fa-solid fa-play"></i></span>'

      if (workOrder.workOrderCloseDateTime !== null) {
        openClosedIconHTML =
          '<span class="icon has-text-grey" title="Closed"><i class="fa-solid fa-stop"></i></span>'
      } else if (workOrder.workOrderDueDateTime !== null) {
        const dueDateTime = new Date(workOrder.workOrderDueDateTime as string)
        const now = new Date()
        if (dueDateTime < now) {
          openClosedIconHTML =
            '<span class="icon has-text-danger" title="Overdue"><i class="fa-solid fa-exclamation-triangle"></i></span>'
        }
      }

      let extraDateHTML = ''

      if (workOrder.workOrderCloseDateTime !== null) {
        extraDateHTML = `<i class="fa-solid fa-stop" title="Close Date"></i> ${cityssm.dateToString(new Date(workOrder.workOrderCloseDateTime ?? ''))}`
      }
      else if (workOrder.workOrderDueDateTime !== null) {
        extraDateHTML = `<i class="fa-solid fa-exclamation-triangle" title="Due Date"></i> ${cityssm.dateToString(new Date(workOrder.workOrderDueDateTime ?? ''))}`
      }

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td class="has-text-centered">
          ${openClosedIconHTML}<br />
          ${
            workOrder.milestonesCount && workOrder.milestonesCount > 0
              ? /* html */ `
                <span class="tag">
                  ${workOrder.milestonesCompletedCount} / ${workOrder.milestonesCount}
                </span>
              `
              : ''
          }
        </td>
        <td>
          <a href="${shiftLog.buildWorkOrderURL(workOrder.workOrderId)}">
            ${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a><br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(workOrder.workOrderType ?? '-')}
          </span>
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '-' : workOrder.locationAddress1)}<br />
          <span class="is-size-7 has-text-grey">
            ${cityssm.escapeHTML(workOrder.locationAddress2)}
          </span>
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '(No Status)')}</td>
        <td>
          ${cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime))}<br />
          <span class="is-size-7 has-text-grey">
            ${extraDateHTML}
          </span>
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.requestorName.trim() === '' ? '-' : workOrder.requestorName)}
        </td>
        <td>
          ${cityssm.escapeHTML((workOrder.assignedToDataListItem ?? '') === '' ? '-' : (workOrder.assignedToDataListItem ?? ''))}
        </td>
        <td class="is-hidden-print">
          <a
            class="button is-small is-info is-light"
            href="${shiftLog.buildWorkOrderURL(workOrder.workOrderId)}/print"
            title="Print Work Order"
            target="_blank"
          >
            <span class="icon is-small"><i class="fa-solid fa-print"></i></span>
          </a>
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
      `${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doSearchWorkOrders`,
      filtersFormElement,
      (rawResponseJSON) => {
        const responseJSON =
          rawResponseJSON as unknown as DoSearchWorkOrdersResponse

        renderWorkOrdersTable(responseJSON)
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
