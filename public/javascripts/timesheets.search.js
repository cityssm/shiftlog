"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var urlPrefix = "".concat(shiftLog.urlPrefix, "/").concat(shiftLog.timesheetsRouter);
    var formElement = document.querySelector('#form--timesheetSearch');
    var searchResultsContainerElement = document.querySelector('#container--timesheetSearchResults');
    var offsetElement = formElement.querySelector('#timesheetSearch--offset');
    var currentTimesheetDateString = cityssm.dateToString(new Date());
    function renderTimesheetResults(data) {
        var _a, _b, _c;
        if (data.timesheets.length === 0) {
            searchResultsContainerElement.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <p class=\"message-body\">No records found.</p>\n        </div>\n      ";
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = /* html */ "\n      <thead>\n        <tr>\n          <th>ID</th>\n          <th>Type</th>\n          <th>Date</th>\n          <th>Title</th>\n          <th>Supervisor</th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ";
        var tableBodyElement = tableElement.querySelector('tbody');
        for (var _i = 0, _d = data.timesheets; _i < _d.length; _i++) {
            var timesheet = _d[_i];
            var timesheetDate = typeof timesheet.timesheetDate === 'string'
                ? new Date(timesheet.timesheetDate)
                : timesheet.timesheetDate;
            var tableRowElement = document.createElement('tr');
            tableRowElement.innerHTML = /* html */ "\n        <td>\n          <a href=\"".concat(exports.shiftLog.buildTimesheetURL(timesheet.timesheetId), "\">\n            ").concat(cityssm.escapeHTML(timesheet.timesheetId.toString()), "\n          </a>\n        </td>\n        <td>").concat(cityssm.escapeHTML((_a = timesheet.timesheetTypeDataListItem) !== null && _a !== void 0 ? _a : '(Unknown Timesheet Type)'), "</td>\n        <td>").concat(cityssm.dateToString(timesheetDate), "</td>\n        <td>").concat(cityssm.escapeHTML(timesheet.timesheetTitle === '' ? '(No Title)' : timesheet.timesheetTitle), "</td>\n        <td>\n          ").concat(cityssm.escapeHTML((_b = timesheet.supervisorLastName) !== null && _b !== void 0 ? _b : ''), ", ").concat(cityssm.escapeHTML((_c = timesheet.supervisorFirstName) !== null && _c !== void 0 ? _c : ''), "\n        </td>\n      ");
            tableBodyElement.append(tableRowElement);
        }
        searchResultsContainerElement.replaceChildren(tableElement);
        // Pagination
        searchResultsContainerElement.append(shiftLog.buildPaginationControls({
            totalCount: data.totalCount,
            currentPageOrOffset: data.offset,
            itemsPerPageOrLimit: data.limit,
            clickHandler: function (pageNumber) {
                offsetElement.value = ((pageNumber - 1) * data.limit).toString();
                doSearch();
            }
        }));
    }
    function doSearch() {
        cityssm.postJSON("".concat(urlPrefix, "/doSearchTimesheets"), formElement, function (responseJSON) {
            renderTimesheetResults(responseJSON);
        });
    }
    // Set up search on change
    formElement.addEventListener('change', function () {
        offsetElement.value = '0';
        doSearch();
    });
    // Initial search with current date
    var timesheetDateStringElement = document.createElement('input');
    timesheetDateStringElement.name = 'timesheetDateString';
    timesheetDateStringElement.type = 'hidden';
    timesheetDateStringElement.value = currentTimesheetDateString;
    formElement.prepend(timesheetDateStringElement);
    doSearch();
})();
//# sourceMappingURL=timesheets.search.js.map