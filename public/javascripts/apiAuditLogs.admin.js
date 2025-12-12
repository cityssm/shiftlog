"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a, _b;
    var shiftLog = exports.shiftLog;
    var containerElement = document.querySelector('#container--auditLogs');
    function renderAuditLogs(logs) {
        var _a, _b;
        if (logs.length === 0) {
            var messageHTML = "<div class=\"message is-info\">\n        <div class=\"message-body\">\n          No audit logs found.\n        </div>\n      </div>";
            // Safe to assign since messageHTML is a static string with no user input
            // eslint-disable-next-line no-unsanitized/property
            containerElement.innerHTML = messageHTML;
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
            var maxEndpointLength = 50;
            var minStatusSuccess = 400;
            var statusBadge = '';
            if (log.responseStatus !== null && log.responseStatus !== undefined) {
                var statusClass = log.responseStatus < minStatusSuccess ? 'is-success' : 'is-danger';
                statusBadge = "<span class=\"tag ".concat(statusClass, "\">").concat(log.responseStatus, "</span>");
            }
            var displayEndpoint = log.endpoint;
            if (log.endpoint.length > maxEndpointLength) {
                displayEndpoint = log.endpoint.slice(0, maxEndpointLength) + '...';
            }
            var escapedContent = {
                displayEndpoint: cityssm.escapeHTML(displayEndpoint),
                endpoint: cityssm.escapeHTML(log.endpoint),
                ipAddress: cityssm.escapeHTML((_a = log.ipAddress) !== null && _a !== void 0 ? _a : '-'),
                requestMethod: cityssm.escapeHTML(log.requestMethod),
                requestTime: cityssm.escapeHTML(requestTime.toLocaleString()),
                userName: cityssm.escapeHTML((_b = log.userName) !== null && _b !== void 0 ? _b : '-')
            };
            tableHTML += "<tr>\n        <td>".concat(escapedContent.requestTime, "</td>\n        <td>").concat(escapedContent.userName, "</td>\n        <td class=\"is-size-7\" title=\"").concat(escapedContent.endpoint, "\">").concat(escapedContent.displayEndpoint, "</td>\n        <td><span class=\"tag\">").concat(escapedContent.requestMethod, "</span></td>\n        <td>").concat(isValidIcon, "</td>\n        <td>").concat(escapedContent.ipAddress, "</td>\n        <td>").concat(statusBadge, "</td>\n      </tr>");
        }
        tableHTML += '</tbody></table>';
        // Safe to assign since all user content has been escaped with cityssm.escapeHTML
        // eslint-disable-next-line no-unsanitized/property
        containerElement.innerHTML = tableHTML;
    }
    function loadAuditLogs() {
        var userName = document.querySelector('#filter--userName').value.trim();
        var isValidApiKeyValue = document.querySelector('#filter--isValidApiKey').value;
        var defaultLimit = 100;
        var requestBody = {
            limit: defaultLimit
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
