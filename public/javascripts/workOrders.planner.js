"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var filtersFormElement = document.querySelector('#form--workOrderPlanner');
    var dateFilterElement = document.querySelector('#workOrderPlanner--dateFilter');
    var daysThresholdElement = document.querySelector('#workOrderPlanner--daysThreshold');
    var assignedToElement = document.querySelector('#workOrderPlanner--assignedToDataListItemId');
    var offsetInputElement = document.querySelector('#workOrderPlanner--offset');
    var resultsContainerElement = document.querySelector('#container--workOrderPlannerResults');
    // Enable/disable days threshold based on date filter selection
    dateFilterElement.addEventListener('change', function () {
        var requiresDays = ['openForDays', 'dueInDays', 'milestonesDueInDays'].includes(dateFilterElement.value);
        daysThresholdElement.disabled = !requiresDays;
        if (requiresDays && daysThresholdElement.value === '') {
            daysThresholdElement.value = '7';
        }
    });
    function renderWorkOrdersTable(data) {
        var _a, _b, _c, _d;
        if (data.workOrders.length === 0) {
            resultsContainerElement.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <p class=\"message-body\">No work orders found matching the selected criteria.</p>\n        </div>\n      ";
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable is-narrow';
        tableElement.innerHTML = /* html */ "\n      <thead>\n        <tr>\n          <th class=\"has-width-1\">\n            <span class=\"is-sr-only\">Priority</span>\n          </th>\n          <th>Number</th>\n          <th>Location</th>\n          <th>Status</th>\n          <th>Open Date</th>\n          <th>Due Date</th>\n          <th>Requestor</th>\n          <th>Assigned To</th>\n          <th class=\"has-width-1 is-hidden-print\">\n            <span class=\"is-sr-only\">Actions</span>\n          </th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ";
        var tableBodyElement = tableElement.querySelector('tbody');
        for (var _i = 0, _e = data.workOrders; _i < _e.length; _i++) {
            var workOrder = _e[_i];
            var tableRowElement = document.createElement('tr');
            var priorityIconHTML = '<span class="icon has-text-success" title="Open"><i class="fa-solid fa-circle"></i></span>';
            var now = new Date();
            var isOverdue = workOrder.workOrderDueDateTime !== null &&
                new Date(workOrder.workOrderDueDateTime) < now;
            if (isOverdue) {
                priorityIconHTML =
                    '<span class="icon has-text-danger" title="Overdue"><i class="fa-solid fa-exclamation-triangle"></i></span>';
                tableRowElement.classList.add('has-background-danger-light');
            }
            var openDate = cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime));
            var daysOpen = Math.floor((now.getTime() -
                new Date(workOrder.workOrderOpenDateTime).getTime()) /
                (1000 * 60 * 60 * 24));
            var dueDateHTML = workOrder.workOrderDueDateTime !== null
                ? cityssm.dateToString(new Date(workOrder.workOrderDueDateTime))
                : '-';
            var milestonesHTML = workOrder.milestonesCount && workOrder.milestonesCount > 0
                ? /* html */ "\n              <span class=\"tag ".concat(workOrder.overdueMilestonesCount > 0 ? 'is-danger' : 'is-info', "\">\n                ").concat(workOrder.milestonesCompletedCount, " / ").concat(workOrder.milestonesCount, "\n              </span>\n            ")
                : '';
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ "\n        <td class=\"has-text-centered\">\n          ".concat(priorityIconHTML, "<br />\n          ").concat(milestonesHTML, "\n        </td>\n        <td>\n          <a href=\"").concat(shiftLog.buildWorkOrderURL(workOrder.workOrderId), "\">\n            ").concat(cityssm.escapeHTML(workOrder.workOrderNumber), "\n          </a><br />\n          <span class=\"is-size-7\">\n            ").concat(cityssm.escapeHTML((_a = workOrder.workOrderType) !== null && _a !== void 0 ? _a : '-'), "\n          </span>\n        </td>\n        <td>\n          ").concat(cityssm.escapeHTML(workOrder.locationAddress1 === '' ? '-' : workOrder.locationAddress1), "<br />\n          <span class=\"is-size-7 has-text-grey\">\n            ").concat(cityssm.escapeHTML(workOrder.locationAddress2), "\n          </span>\n        </td>\n        <td>").concat(cityssm.escapeHTML((_b = workOrder.workOrderStatusDataListItem) !== null && _b !== void 0 ? _b : '(No Status)'), "</td>\n        <td>\n          ").concat(openDate, "<br />\n          <span class=\"is-size-7 has-text-grey\">\n            (").concat(daysOpen, " ").concat(daysOpen === 1 ? 'day' : 'days', " ago)\n          </span>\n        </td>\n        <td class=\"").concat(isOverdue ? 'has-text-danger has-text-weight-bold' : '', "\">\n          ").concat(dueDateHTML, "\n        </td>\n        <td>\n          ").concat(cityssm.escapeHTML(workOrder.requestorName.trim() === '' ? '-' : workOrder.requestorName), "\n        </td>\n        <td>\n          ").concat(cityssm.escapeHTML(((_c = workOrder.assignedToDataListItem) !== null && _c !== void 0 ? _c : '') === '' ? '(Unassigned)' : ((_d = workOrder.assignedToDataListItem) !== null && _d !== void 0 ? _d : '')), "\n        </td>\n        <td class=\"is-hidden-print\">\n          <a\n            class=\"button is-small is-info is-light\"\n            href=\"").concat(shiftLog.buildWorkOrderURL(workOrder.workOrderId), "/print\"\n            title=\"Print Work Order\"\n            target=\"_blank\"\n          >\n            <span class=\"icon is-small\"><i class=\"fa-solid fa-print\"></i></span>\n          </a>\n        </td>\n      ");
            tableBodyElement.append(tableRowElement);
        }
        resultsContainerElement.replaceChildren(tableElement);
        // Pagination
        resultsContainerElement.append(shiftLog.buildPaginationControls({
            totalCount: data.totalCount,
            currentPageOrOffset: data.offset,
            itemsPerPageOrLimit: data.limit,
            clickHandler: function (pageNumber) {
                offsetInputElement.value = ((pageNumber - 1) * data.limit).toString();
                getPlannerResults();
            }
        }));
    }
    function getPlannerResults() {
        resultsContainerElement.innerHTML = /* html */ "\n      <div class=\"has-text-centered py-5\">\n        <span class=\"icon is-large has-text-grey-lighter\">\n          <i class=\"fa-solid fa-spinner fa-pulse fa-2x\"></i>\n        </span>\n      </div>\n    ";
        // Handle "unassigned" special value
        var formData = new FormData(filtersFormElement);
        var requestData = {};
        // @ts-expect-error - FormData.entries() is available in modern browsers
        for (var _i = 0, _a = formData.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (key === 'assignedToDataListItemId' && value === 'unassigned') {
                requestData.includeUnassigned = true;
            }
            else {
                requestData[key] = value;
            }
        }
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.workOrdersRouter, "/doGetWorkOrdersForPlanner"), requestData, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            renderWorkOrdersTable(responseJSON);
        });
    }
    filtersFormElement.addEventListener('submit', function (event) {
        event.preventDefault();
    });
    var formElements = filtersFormElement.querySelectorAll('input, select');
    // @ts-expect-error - NodeListOf is iterable in modern browsers
    for (var _i = 0, formElements_1 = formElements; _i < formElements_1.length; _i++) {
        var formElement = formElements_1[_i];
        formElement.addEventListener('change', function () {
            offsetInputElement.value = '0';
            getPlannerResults();
        });
    }
    getPlannerResults();
})();
