(() => {
    const shiftLog = exports.shiftLog;
    const containerElement = document.querySelector('#container--auditLogs');
    function renderAuditLogs(logs) {
        if (logs.length === 0) {
            const messageHTML = `<div class="message is-info">
        <div class="message-body">
          No audit logs found.
        </div>
      </div>`;
            // Safe to assign since messageHTML is a static string with no user input
            // eslint-disable-next-line no-unsanitized/property
            containerElement.innerHTML = messageHTML;
            return;
        }
        let tableHTML = `<table class="table is-fullwidth is-striped is-hoverable">
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
      <tbody>`;
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
                displayEndpoint = log.endpoint.slice(0, maxEndpointLength) + '...';
            }
            const escapedContent = {
                displayEndpoint: cityssm.escapeHTML(displayEndpoint),
                endpoint: cityssm.escapeHTML(log.endpoint),
                ipAddress: cityssm.escapeHTML(log.ipAddress ?? '-'),
                requestMethod: cityssm.escapeHTML(log.requestMethod),
                requestTime: cityssm.escapeHTML(requestTime.toLocaleString()),
                userName: cityssm.escapeHTML(log.userName ?? '-')
            };
            tableHTML += `<tr>
        <td>${escapedContent.requestTime}</td>
        <td>${escapedContent.userName}</td>
        <td class="is-size-7" title="${escapedContent.endpoint}">${escapedContent.displayEndpoint}</td>
        <td><span class="tag">${escapedContent.requestMethod}</span></td>
        <td>${isValidIcon}</td>
        <td>${escapedContent.ipAddress}</td>
        <td>${statusBadge}</td>
      </tr>`;
        }
        tableHTML += '</tbody></table>';
        // Safe to assign since all user content has been escaped with cityssm.escapeHTML
        // eslint-disable-next-line no-unsanitized/property
        containerElement.innerHTML = tableHTML;
    }
    function loadAuditLogs() {
        const userName = document.querySelector('#filter--userName').value.trim();
        const isValidApiKeyValue = document.querySelector('#filter--isValidApiKey').value;
        const defaultLimit = 100;
        const requestBody = {
            limit: defaultLimit
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
                renderAuditLogs(responseJSON.logs);
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
            loadAuditLogs();
        }
    });
    // Initial load
    loadAuditLogs();
})();
