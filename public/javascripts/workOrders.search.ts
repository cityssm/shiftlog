import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoSearchWorkOrdersResponse } from '../../handlers/workOrders-post/doSearchWorkOrders.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const filtersFormElement = document.querySelector(
    '#form--workOrderSearch'
  ) as HTMLFormElement

  const offsetInputElement = document.querySelector(
    '#workOrderSearch--offset'
  ) as HTMLInputElement

  const resultsContainerElement = document.querySelector(
    '#container--workOrderSearchResults'
  ) as HTMLDivElement

  function buildPaginationControls(
    totalCount: number,
    limit: number,
    offset: number
  ): HTMLElement {
    const paginationElement = document.createElement('nav')
    paginationElement.className = 'pagination is-centered'
    paginationElement.setAttribute('role', 'navigation')
    paginationElement.setAttribute('aria-label', 'pagination')

    const totalPages = Math.ceil(totalCount / limit)
    const currentPage = Math.floor(offset / limit) + 1
    let paginationHTML = ''

    // Previous button
    paginationHTML +=
      currentPage > 1
        ? `<a class="pagination-previous" href="#" data-page-number="${
            currentPage - 1
          }">Previous</a>`
        : '<a class="pagination-previous" disabled>Previous</a>'

    // Next button
    paginationHTML +=
      currentPage < totalPages
        ? `<a class="pagination-next" href="#" data-page-number="${
            currentPage + 1
          }">Next</a>`
        : '<a class="pagination-next" disabled>Next</a>'

    // Page numbers
    paginationHTML += `<ul class="pagination-list">`

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      paginationHTML +=
        pageNumber === currentPage
          ? `<li><a class="pagination-link is-current" aria-current="page">${pageNumber}</a></li>`
          : `<li><a class="pagination-link" href="#" data-page-number="${pageNumber}">${pageNumber}</a></li>`
    }

    paginationHTML += `</ul>`

    // eslint-disable-next-line no-unsanitized/property
    paginationElement.innerHTML = paginationHTML

    // Event listeners
    const pageLinks = paginationElement.querySelectorAll(
      'a.pagination-previous, a.pagination-next, a.pagination-link'
    )

    for (const pageLink of pageLinks) {
      pageLink.addEventListener('click', (event) => {
        event.preventDefault()
        const target = event.currentTarget as HTMLElement
        const pageNumberString = target.dataset.pageNumber

        if (pageNumberString !== undefined) {
          const pageNumber = Number.parseInt(pageNumberString, 10)
          offsetInputElement.value = ((pageNumber - 1) * limit).toString()
          getSearchResults()
        }
      })
    }

    return paginationElement
  }

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
          <a href="${exports.shiftLog.buildWorkOrderURL(workOrder.workOrderId)}">
            ${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a><br />
          <span class="is-size-7">${cityssm.escapeHTML(workOrder.workOrderType ?? '(Unknown Type)')}</span>
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '(No Location)' : workOrder.locationAddress1)}<br />
          <span class="is-size-7 has-text-grey">${cityssm.escapeHTML(workOrder.locationAddress2)}</span>
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '(No Status)')}</td>
        <td>
          ${cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime))}<br />
          <span class="is-size-7 has-text-grey">
            ${workOrder.workOrderDueDateTime === null ? '' : `Due ${cityssm.dateToString(new Date(workOrder.workOrderDueDateTime ?? ''))}`}
          </span>
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.requestorName.trim() === '' ? '-' : workOrder.requestorName)}
        </td>
        <td>
          ${cityssm.escapeHTML((workOrder.assignedToDataListItem ?? '') === '' ? '-' : workOrder.assignedToDataListItem ?? '')}
        </td>
        <td>
          <a
            class="button is-small is-info is-light"
            href="${exports.shiftLog.buildWorkOrderURL(workOrder.workOrderId)}/print"
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
      buildPaginationControls(data.totalCount, data.limit, data.offset)
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
      `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doSearchWorkOrders`,
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
