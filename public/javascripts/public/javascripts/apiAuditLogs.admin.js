(() => {
    const shiftLog = exports.shiftLog;
    const containerElement = document.querySelector('#container--auditLogs');
    function renderAuditLogs(logs) {
        if (logs.length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
        <div class="message-body">
          No audit logs found.
        </div>
      </div>`;
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
            const requestTime = new Date(log.requestTime);
            const isValidIcon = log.isValidApiKey
                ? '<span class="icon has-text-success"><i class="fa-solid fa-check"></i></span>'
                : '<span class="icon has-text-danger"><i class="fa-solid fa-times"></i></span>';
            const statusBadge = log.responseStatus
                ? `<span class="tag ${log.responseStatus < 400 ? 'is-success' : 'is-danger'}">${log.responseStatus}</span>`
                : '';
            tableHTML += `<tr>
        <td>${cityssm.escapeHTML(requestTime.toLocaleString())}</td>
        <td>${cityssm.escapeHTML(log.userName ?? '-')}</td>
        <td class="is-size-7" title="${cityssm.escapeHTML(log.endpoint)}">${cityssm.escapeHTML(log.endpoint.length > 50 ? log.endpoint.substring(0, 50) + '...' : log.endpoint)}</td>
        <td><span class="tag">${cityssm.escapeHTML(log.requestMethod)}</span></td>
        <td>${isValidIcon}</td>
        <td>${cityssm.escapeHTML(log.ipAddress ?? '-')}</td>
        <td>${statusBadge}</td>
      </tr>`;
        }
        tableHTML += '</tbody></table>';
        containerElement.innerHTML = tableHTML;
    }
    function loadAuditLogs() {
        const userName = document.querySelector('#filter--userName').value.trim();
        const isValidApiKeyValue = document.querySelector('#filter--isValidApiKey').value;
        const requestBody = {
            limit: 100
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
export {};
