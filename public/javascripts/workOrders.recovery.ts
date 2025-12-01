import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { WorkOrder } from '../../types/record.types.js'
import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const filtersFormElement = document.querySelector(
    '#form--deletedRecordSearch'
  ) as HTMLFormElement

  const offsetInputElement = document.querySelector(
    '#deletedRecordSearch--offset'
  ) as HTMLInputElement

  const resultsContainerElement = document.querySelector(
    '#container--deletedRecordResults'
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

    paginationHTML +=
      currentPage > 1
        ? `<a class="pagination-previous" href="#" data-page-number="${
            currentPage - 1
          }">Previous</a>`
        : '<a class="pagination-previous" disabled>Previous</a>'

    paginationHTML +=
      currentPage < totalPages
        ? `<a class="pagination-next" href="#" data-page-number="${
            currentPage + 1
          }">Next</a>`
        : '<a class="pagination-next" disabled>Next</a>'

    paginationHTML += '<ul class="pagination-list">'

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      paginationHTML +=
        pageNumber === currentPage
          ? `<li><a class="pagination-link is-current" aria-current="page">${pageNumber}</a></li>`
          : `<li><a class="pagination-link" href="#" data-page-number="${pageNumber}">${pageNumber}</a></li>`
    }

    paginationHTML += '</ul>'

    // eslint-disable-next-line no-unsanitized/property
    paginationElement.innerHTML = paginationHTML

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
          getDeletedRecords()
        }
      })
    }

    return paginationElement
  }

  function recoverWorkOrder(workOrderId: number): void {
    cityssm.confirmModal(
      'Recover Work Order?',
      'Are you sure you want to recover this work order?',
      'Yes, Recover',
      'warning',
      async () => {
        cityssm.postJSON(
          `${exports.shiftLog.urlPrefix}/workOrders/doRecoverWorkOrder`,
          { workOrderId },
          (response) => {
            if (response.success) {
              cityssm.alertModal(
                'Work Order Recovered',
                'The work order has been recovered successfully.',
                'success',
                () => {
                  window.location.href = response.redirectUrl as string
                }
              )
            } else {
              cityssm.alertModal(
                'Error',
                response.errorMessage ?? 'Failed to recover work order.',
                'danger'
              )
            }
          }
        )
      }
    )
  }

  function renderDeletedRecordsTable(data: {
    success: boolean
    workOrders: WorkOrder[]
    totalCount: number
  }): void {
    if (data.workOrders.length === 0) {
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
          <th>Number</th>
          <th>Type</th>
          <th>Location</th>
          <th>Status</th>
          <th>Open Date</th>
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

    for (const workOrder of data.workOrders) {
      const tableRowElement = document.createElement('tr')

      // eslint-disable-next-line no-unsanitized/property
      tableRowElement.innerHTML = /* html */ `
        <td>
          ${cityssm.escapeHTML(workOrder.workOrderNumber)}
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderType ?? '-')}</td>
        <td>
          ${cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '-' : workOrder.locationAddress1)}
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '(No Status)')}</td>
        <td>
          ${cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime))}
        </td>
        <td>${cityssm.escapeHTML(workOrder.recordDelete_userName ?? '')}</td>
        <td>
          ${workOrder.recordDelete_dateTime ? cityssm.dateToString(new Date(workOrder.recordDelete_dateTime)) : ''}
        </td>
        <td>
          <button
            class="button is-small is-success is-light"
            data-work-order-id="${workOrder.workOrderId}"
            type="button">
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
        recoverWorkOrder(workOrder.workOrderId)
      })

      tableBodyElement.append(tableRowElement)
    }

    resultsContainerElement.innerHTML = ''
    resultsContainerElement.append(tableElement)

    const formData = new FormData(filtersFormElement)
    const limit = Number.parseInt(formData.get('limit') as string, 10)
    const offset = Number.parseInt(formData.get('offset') as string, 10)

    if (data.totalCount > limit) {
      resultsContainerElement.append(
        buildPaginationControls(data.totalCount, limit, offset)
      )
    }
  }

  async function getDeletedRecords(): Promise<void> {
    resultsContainerElement.innerHTML = /* html */ `
      <div class="message">
        <p class="message-body has-text-centered">
          <span class="icon"><i class="fa-solid fa-spinner fa-spin"></i></span>
          <span>Loading...</span>
        </p>
      </div>
    `

    const formData = new FormData(filtersFormElement)

    cityssm.postJSON(
      `${exports.shiftLog.urlPrefix}/workOrders/doGetDeletedWorkOrders`,
      formData,
      renderDeletedRecordsTable
    )
  }

  getDeletedRecords()
})()
