(() => {
    const shiftLog = exports.shiftLog;
    const containerElement = document.querySelector('#container--auditLogs');
    // Pagination settings
    const ITEMS_PER_PAGE = 50;
    let currentPage = 1;
    let totalCount = 0;
    function pageSelect(pageNumber) {
        currentPage = pageNumber;
        loadAuditLogs();
    }
    function renderAuditLogs(logs) {
        if (logs.length === 0) {
            containerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <div class="message-body">
            No audit logs found.
          </div>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
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
        </tr>
      </thead>
      <tbody></tbody>
    `;
        for (const log of logs) {
            const requestTime = typeof log.requestTime === 'string'
                ? new Date(log.requestTime)
                : log.requestTime;
            const isValidIcon = log.isValidApiKey
                ? '<span class="icon has-text-success"><i class="fa-solid fa-check"></i></span>'
                : '<span class="icon has-text-danger"><i class="fa-solid fa-times"></i></span>';
            const maxEndpointLength = 50;
            const minStatusSuccess = 400;
            let statusBadge = '';
            if (log.responseStatus !== null && log.responseStatus !== undefined) {
                const statusClass = log.responseStatus < minStatusSuccess ? 'is-success' : 'is-danger';
                statusBadge = `<span class="tag ${statusClass}">${log.responseStatus}</span>`;
            }
            let displayEndpoint = log.endpoint;
            if (log.endpoint.length > maxEndpointLength) {
                displayEndpoint = '...' + log.endpoint.slice(-maxEndpointLength);
            }
            const escapedContent = {
                displayEndpoint: cityssm.escapeHTML(displayEndpoint),
                endpoint: cityssm.escapeHTML(log.endpoint),
                ipAddress: cityssm.escapeHTML(log.ipAddress ?? '-'),
                requestMethod: cityssm.escapeHTML(log.requestMethod),
                requestTime: cityssm.escapeHTML(requestTime.toLocaleString()),
                userName: cityssm.escapeHTML(log.userName ?? '-')
            };
            // eslint-disable-next-line no-unsanitized/method
            tableElement.querySelector('tbody')?.insertAdjacentHTML('beforeend', 
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
          </tr>
        `);
        }
        containerElement.replaceChildren(tableElement);
    }
    function loadAuditLogs() {
        const userName = document.querySelector('#filter--userName').value.trim();
        const isValidApiKeyValue = document.querySelector('#filter--isValidApiKey').value;
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const requestBody = {
            limit: ITEMS_PER_PAGE,
            offset
        };
        if (userName !== '') {
            requestBody.userName = userName;
        }
        if (isValidApiKeyValue !== '') {
            requestBody.isValidApiKey = isValidApiKeyValue === 'true';
        }
        cityssm.postJSON(`${shiftLog.urlPrefix}/admin/doGetApiAuditLogs`, requestBody, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                totalCount = responseJSON.totalCount;
                renderAuditLogs(responseJSON.logs);
                // Add pagination controls if needed
                if (totalCount > ITEMS_PER_PAGE) {
                    const paginationControls = shiftLog.buildPaginationControls({
                        clickHandler: pageSelect,
                        currentPageOrOffset: currentPage,
                        itemsPerPageOrLimit: ITEMS_PER_PAGE,
                        totalCount
                    });
                    containerElement.append(paginationControls);
                }
            }
        });
    }
    // Event listeners
    document
        .querySelector('#button--refresh')
        ?.addEventListener('click', loadAuditLogs);
    document
        .querySelector('#filter--userName')
        ?.addEventListener('keyup', (keyEvent) => {
        if (keyEvent.key === 'Enter') {
            currentPage = 1;
            loadAuditLogs();
        }
    });
    // Auto-refresh on filter change
    document
        .querySelector('#filter--isValidApiKey')
        ?.addEventListener('change', () => {
        currentPage = 1;
        loadAuditLogs();
    });
    // Initial load
    loadAuditLogs();
})();
