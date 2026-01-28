import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoGetApiAuditLogsResponse } from '../../handlers/admin-post/doGetApiAuditLogs.js'
import type { DoResetUserApiKeyResponse } from '../../handlers/admin-post/doResetUserApiKey.js'
import type { ApiAuditLog } from '../../types/record.types.js'

import type { ShiftLogGlobal } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  shiftLog: ShiftLogGlobal
}
;(() => {
  const shiftLog = exports.shiftLog
  const containerElement = document.querySelector(
    '#container--auditLogs'
  ) as HTMLDivElement

  // Pagination settings
  const ITEMS_PER_PAGE = 50
  let currentPage = 1
  let totalCount = 0

  function resetApiKeyFromButton(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement
    const userName = buttonElement.dataset.userName

    if (userName === undefined) {
      return
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      title: 'Reset API Key',

      message: `Are you sure you want to reset the API key for user "${userName}"? The old key will no longer work.`,
      okButton: {
        contextualColorName: 'warning',
        text: 'Reset API Key',

        callbackFunction() {
          cityssm.postJSON(
            `${shiftLog.urlPrefix}/admin/doResetUserApiKey`,
            {
              userName
            },
            (rawResponseJSON) => {
              const responseJSON = rawResponseJSON as DoResetUserApiKeyResponse
              if (responseJSON.success) {
                bulmaJS.alert({
                  contextualColorName: 'success',
                  title: 'API Key Reset',

                  message: `API key has been successfully reset for user "${userName}".`
                })

                // Reload the audit logs to reflect any changes
                loadAuditLogs()
              } else {
                bulmaJS.alert({
                  contextualColorName: 'danger',
                  title: 'Error Resetting API Key',

                  message: responseJSON.message ?? 'Please try again.'
                })
              }
            }
          )
        }
      }
    })
  }

  function pageSelect(pageNumber: number): void {
    currentPage = pageNumber
    loadAuditLogs()
  }

  function renderAuditLogs(logs: ApiAuditLog[]): void {
    if (logs.length === 0) {
      containerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <div class="message-body">
            No audit logs found.
          </div>
        </div>
      `
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Request Time</th>
          <th>User Name</th>
          <th>Endpoint</th>
          <th>Method</th>
          <th>Valid Key</th>
          <th>IP Address</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `

    for (const log of logs) {
      const requestTime =
        typeof log.requestTime === 'string'
          ? new Date(log.requestTime)
          : log.requestTime

      const isValidIcon = log.isValidApiKey
        ? '<span class="icon has-text-success"><i class="fa-solid fa-check"></i></span>'
        : '<span class="icon has-text-danger"><i class="fa-solid fa-times"></i></span>'

      const maxEndpointLength = 50
      const minStatusSuccess = 400

      let statusBadge = ''
      if (log.responseStatus !== null && log.responseStatus !== undefined) {
        const statusClass =
          log.responseStatus < minStatusSuccess ? 'is-success' : 'is-danger'
        statusBadge = `<span class="tag ${statusClass}">${log.responseStatus}</span>`
      }

      let displayEndpoint = log.endpoint
      if (log.endpoint.length > maxEndpointLength) {
        displayEndpoint = `...${log.endpoint.slice(-maxEndpointLength)}`
      }

      const escapedContent = {
        displayEndpoint: cityssm.escapeHTML(displayEndpoint),
        endpoint: cityssm.escapeHTML(log.endpoint),
        ipAddress: cityssm.escapeHTML(log.ipAddress ?? '-'),
        requestMethod: cityssm.escapeHTML(log.requestMethod),
        requestTime: cityssm.escapeHTML(requestTime.toLocaleString()),
        userName: cityssm.escapeHTML(log.userName ?? '-'),
        rawUserName: log.userName ?? ''
      }

      // eslint-disable-next-line no-unsanitized/method -- Escaped content
      tableElement.querySelector('tbody')?.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <tr>
            <td>${escapedContent.requestTime}</td>
            <td>${escapedContent.userName}</td>
            <td class="is-vcentered is-size-7" title="${escapedContent.endpoint}">
              ${escapedContent.displayEndpoint}
            </td>
            <td><span class="tag">${escapedContent.requestMethod}</span></td>
            <td>${isValidIcon}</td>
            <td>${escapedContent.ipAddress}</td>
            <td>${statusBadge}</td>
            <td>
              ${
                escapedContent.rawUserName === ''
                  ? ''
                  : `<button
                      class="button is-small is-warning reset-api-key"
                      data-user-name="${escapedContent.userName}"
                      title="Reset API Key for ${escapedContent.userName}"
                    >
                      <span class="icon is-small">
                        <i class="fa-solid fa-rotate"></i>
                      </span>
                      <span>Reset Key</span>
                    </button>`
              }
            </td>
          </tr>
        `
      )
    }

    // Add event listeners for reset API key buttons
    for (const button of tableElement.querySelectorAll('.reset-api-key')) {
      button.addEventListener('click', resetApiKeyFromButton)
    }

    containerElement.replaceChildren(tableElement)
  }

  function loadAuditLogs(): void {
    const userName = (
      document.querySelector('#filter--userName') as HTMLInputElement
    ).value.trim()
    const isValidApiKeyValue = (
      document.querySelector('#filter--isValidApiKey') as HTMLSelectElement
    ).value

    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    const requestBody: {
      isValidApiKey?: boolean
      limit: number
      offset: number
      userName?: string
    } = {
      limit: ITEMS_PER_PAGE,
      offset
    }

    if (userName !== '') {
      requestBody.userName = userName
    }

    if (isValidApiKeyValue !== '') {
      requestBody.isValidApiKey = isValidApiKeyValue === 'true'
    }

    cityssm.postJSON(
      `${shiftLog.urlPrefix}/admin/doGetApiAuditLogs`,
      requestBody,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as DoGetApiAuditLogsResponse
        if (responseJSON.success) {
          totalCount = responseJSON.totalCount
          renderAuditLogs(responseJSON.logs)

          // Add pagination controls if needed
          if (totalCount > ITEMS_PER_PAGE) {
            const paginationControls = shiftLog.buildPaginationControls({
              clickHandler: pageSelect,
              currentPageOrOffset: currentPage,
              itemsPerPageOrLimit: ITEMS_PER_PAGE,
              totalCount
            })

            containerElement.append(paginationControls)
          }
        }
      }
    )
  }

  // Event listeners
  document
    .querySelector('#button--refresh')
    ?.addEventListener('click', loadAuditLogs)

  document
    .querySelector('#filter--userName')
    ?.addEventListener('keyup', (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Enter') {
        currentPage = 1
        loadAuditLogs()
      }
    })

  // Auto-refresh on filter change
  document
    .querySelector('#filter--isValidApiKey')
    ?.addEventListener('change', () => {
      currentPage = 1
      loadAuditLogs()
    })

  // Initial load
  loadAuditLogs()
})()
