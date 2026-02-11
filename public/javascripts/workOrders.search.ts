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

  // Validate hex color format (6 characters, alphanumeric)
  function isValidHex(color?: string): boolean {
    return color !== undefined && /^[0-9a-f]{6}$/iv.test(color)
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
          <th>
            ${cityssm.escapeHTML(shiftLog.workOrdersSectionNameSingular)}
          </th>
          <th>Location</th>
          <th>Open Date</th>
          <th>Requestor</th>
          <th>Assigned To</th>
          <th>
            <span class="is-sr-only">Properties</span>
          </th>
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
      } else if (workOrder.workOrderDueDateTime !== null) {
        extraDateHTML = `<i class="fa-solid fa-exclamation-triangle" title="Due Date"></i> ${cityssm.dateToString(new Date(workOrder.workOrderDueDateTime ?? ''))}`
      }

      // Build tags HTML
      let tagsHTML = ''

      if (workOrder.tags && workOrder.tags.length > 0) {
        const tagsElements = workOrder.tags
          .map((tag) => {
            const backgroundColor = isValidHex(tag.tagBackgroundColor)
              ? `#${tag.tagBackgroundColor}`
              : ''

            const textColor = isValidHex(tag.tagTextColor)
              ? `#${tag.tagTextColor}`
              : ''

            // Only apply custom styling if both colors are present to ensure consistency
            const style =
              backgroundColor && textColor
                ? `style="background-color: ${backgroundColor}; color: ${textColor};"`
                : ''

            return `<span class="tag is-small" ${style}>${cityssm.escapeHTML(tag.tagName)}</span>`
          })
          .join(' ')

        tagsHTML = `<div class="tags mt-1">${tagsElements}</div>`
      }

      // Build attachment icon HTML
      const attachmentIconHTML =
        workOrder.attachmentsCount && workOrder.attachmentsCount > 0
          ? /* html */ `
            <span class="icon" title="${workOrder.attachmentsCount} attachment(s)">
              <i class="fa-solid fa-paperclip"></i>
            </span>
          `
          : ''

      // Build thumbnail icon HTML
      const thumbnailIconHTML = workOrder.thumbnailAttachmentId
        ? /* html */ `
          <a
            class="icon has-text-info"
            href="${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/attachments/${workOrder.thumbnailAttachmentId}/inline"
            title="View thumbnail image"
            target="_blank"
          >
            <i class="fa-solid fa-image"></i>
          </a>
        `
        : ''

      // Build notes icon HTML
      const notesIconHTML =
        workOrder.notesCount && workOrder.notesCount > 0
          ? /* html */ `
            <span class="icon" title="${workOrder.notesCount} note(s)">
              <i class="fa-solid fa-note-sticky"></i>
            </span>
          `
          : ''

      // Build costs icon HTML
      const costsIconHTML =
        workOrder.costsCount &&
        workOrder.costsCount > 0 &&
        workOrder.costsTotal !== undefined
          ? /* html */ `
            <span class="icon" title="Total Cost: $${workOrder.costsTotal.toFixed(2)}">
              <i class="fa-solid fa-dollar-sign"></i>
            </span>
          `
          : ''

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
          <a class="has-text-weight-semibold" href="${shiftLog.buildWorkOrderURL(workOrder.workOrderId)}">
            ${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a>
          ${thumbnailIconHTML}
          <br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(workOrder.workOrderType ?? '-')}
            -
            ${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '(No Status)')}
            -
            ${cityssm.escapeHTML(workOrder.workOrderPriorityDataListItem ?? '(No Priority)')}
          </span>
          ${tagsHTML}
        </td>
        <td>
          ${cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '-' : workOrder.locationAddress1)}<br />
          <span class="is-size-7 has-text-grey">
            ${cityssm.escapeHTML(workOrder.locationAddress2)}
          </span>
        </td>
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
          ${cityssm.escapeHTML((workOrder.assignedToName ?? '') === '' ? '-' : (workOrder.assignedToName ?? ''))}
        </td>
        <td class="has-text-right">
          ${notesIconHTML}
          ${attachmentIconHTML}
          ${costsIconHTML}
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
      (responseJSON: DoSearchWorkOrdersResponse) => {
        renderWorkOrdersTable(responseJSON)
      }
    )
  }

  filtersFormElement.addEventListener('submit', (event) => {
    event.preventDefault()
  })

  function resetOffsetAndGetResults(): void {
    offsetInputElement.value = '0'
    getSearchResults()
  }

  const formElements = filtersFormElement.querySelectorAll('input, select')

  for (const formElement of formElements) {
    formElement.addEventListener('change', resetOffsetAndGetResults)
  }

  document
    .querySelector('#workOrderSearch--limit')
    ?.addEventListener('change', resetOffsetAndGetResults)

  getSearchResults()
})()
