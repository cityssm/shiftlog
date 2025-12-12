"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a, _b;
    var shiftLog = exports.shiftLog;
    var containerElement = document.querySelector('#container--auditLogs');
    function renderAuditLogs(logs) {
        var _a, _b;
        if (logs.length === 0) {
            containerElement.innerHTML = "<div class=\"message is-info\">\n        <div class=\"message-body\">\n          No audit logs found.\n        </div>\n      </div>";
            return;
        }
        var tableHTML = "<table class=\"table is-fullwidth is-striped is-hoverable\">\n      <thead>\n        <tr>\n          <th>Request Time</th>\n          <th>User Name</th>\n          <th>Endpoint</th>\n          <th>Method</th>\n          <th>Valid Key</th>\n          <th>IP Address</th>\n          <th>Status</th>\n        </tr>\n      </thead>\n      <tbody>";
        for (var _i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
            var log = logs_1[_i];
            var requestTime = typeof log.requestTime === 'string'
                ? new Date(log.requestTime)
                : log.requestTime;
            var isValidIcon = log.isValidApiKey
                ? '<span class="icon has-text-success"><i class="fa-solid fa-check"></i></span>'
                : '<span class="icon has-text-danger"><i class="fa-solid fa-times"></i></span>';
            var statusBadge = log.responseStatus
                ? "<span class=\"tag ".concat(log.responseStatus < 400 ? 'is-success' : 'is-danger', "\">").concat(log.responseStatus, "</span>")
                : '';
            tableHTML += "<tr>\n        <td>".concat(cityssm.escapeHTML(requestTime.toLocaleString()), "</td>\n        <td>").concat(cityssm.escapeHTML((_a = log.userName) !== null && _a !== void 0 ? _a : '-'), "</td>\n        <td class=\"is-size-7\" title=\"").concat(cityssm.escapeHTML(log.endpoint), "\">").concat(cityssm.escapeHTML(log.endpoint.length > 50 ? log.endpoint.substring(0, 50) + '...' : log.endpoint), "</td>\n        <td><span class=\"tag\">").concat(cityssm.escapeHTML(log.requestMethod), "</span></td>\n        <td>").concat(isValidIcon, "</td>\n        <td>").concat(cityssm.escapeHTML((_b = log.ipAddress) !== null && _b !== void 0 ? _b : '-'), "</td>\n        <td>").concat(statusBadge, "</td>\n      </tr>");
        }
        tableHTML += '</tbody></table>';
        containerElement.innerHTML = tableHTML;
    }
    function loadAuditLogs() {
        var userName = document.querySelector('#filter--userName').value.trim();
        var isValidApiKeyValue = document.querySelector('#filter--isValidApiKey').value;
        var requestBody = {
            limit: 100
        };
        if (userName !== '') {
            requestBody.userName = userName;
        }
        if (isValidApiKeyValue !== '') {
            requestBody.isValidApiKey = isValidApiKeyValue === 'true';
        }
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doGetApiAuditLogs"), requestBody, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderAuditLogs(responseJSON.logs);
            }
        });
    }
    // Event listeners
    (_a = document
        .querySelector('#button--refresh')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', loadAuditLogs);
    (_b = document
        .querySelector('#filter--userName')) === null || _b === void 0 ? void 0 : _b.addEventListener('keyup', function (keyEvent) {
        if (keyEvent.key === 'Enter') {
            loadAuditLogs();
        }
    });
    // Initial load
    loadAuditLogs();
})();
