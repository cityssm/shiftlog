"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var resultsContainerElement = document.querySelector('#container--deletedRecordResults');
    function recoverTimesheet(timesheetId) {
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Recover Timesheet?',
            message: 'Are you sure you want to recover this timesheet?',
            okButton: {
                text: 'Yes, Recover',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.timesheetsRouter, "/doRecoverTimesheet"), { timesheetId: timesheetId }, function (response) {
                        var _a;
                        if (response.success) {
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Timesheet Recovered',
                                message: 'The timesheet has been recovered successfully.',
                                okButton: {
                                    callbackFunction: function () {
                                        globalThis.location.href = response.redirectUrl;
                                    }
                                }
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error',
                                message: (_a = response.errorMessage) !== null && _a !== void 0 ? _a : 'Failed to recover timesheet.'
                            });
                        }
                    });
                }
            }
        });
    }
    function renderDeletedRecordsTable(data) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (data.timesheets.length === 0) {
            resultsContainerElement.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <p class=\"message-body\">No deleted records found.</p>\n        </div>\n      ";
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable is-narrow';
        tableElement.innerHTML = /* html */ "\n      <thead>\n        <tr>\n          <th>Date</th>\n          <th>Type</th>\n          <th>Supervisor</th>\n          <th>Details</th>\n          <th>Deleted By</th>\n          <th>Deleted Date</th>\n          <th class=\"has-width-1\">\n            <span class=\"is-sr-only\">Actions</span>\n          </th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ";
        var tableBodyElement = tableElement.querySelector('tbody');
        var _loop_1 = function (timesheet) {
            var tableRowElement = document.createElement('tr');
            var supervisorName = timesheet.supervisorEmployeeSurname ||
                timesheet.supervisorEmployeeGivenName
                ? "".concat((_a = timesheet.supervisorEmployeeSurname) !== null && _a !== void 0 ? _a : '', ", ").concat((_b = timesheet.supervisorEmployeeGivenName) !== null && _b !== void 0 ? _b : '')
                : (_c = timesheet.supervisorEmployeeNumber) !== null && _c !== void 0 ? _c : '-';
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ "\n        <td>\n          ".concat(cityssm.dateToString(new Date(timesheet.timesheetDate)), "\n        </td>\n        <td>").concat(cityssm.escapeHTML((_d = timesheet.timesheetTypeDataListItem) !== null && _d !== void 0 ? _d : '-'), "</td>\n        <td>").concat(cityssm.escapeHTML(supervisorName), "</td>\n        <td>").concat(cityssm.escapeHTML(((_e = timesheet.timesheetDetails) !== null && _e !== void 0 ? _e : '').slice(0, 100))).concat(((_f = timesheet.timesheetDetails) !== null && _f !== void 0 ? _f : '').length > 100 ? '...' : '', "</td>\n        <td>").concat(cityssm.escapeHTML((_g = timesheet.recordDelete_userName) !== null && _g !== void 0 ? _g : ''), "</td>\n        <td>\n          ").concat(timesheet.recordDelete_dateTime ? cityssm.dateToString(new Date(timesheet.recordDelete_dateTime)) : '', "\n        </td>\n        <td>\n          <button\n            class=\"button is-small is-primary is-light\"\n            data-timesheet-id=\"").concat(timesheet.timesheetId, "\"\n            type=\"button\"\n          >\n            <span class=\"icon is-small\">\n              <i class=\"fa-solid fa-undo\"></i>\n            </span>\n            <span>Recover</span>\n          </button>\n        </td>\n      ");
            var recoverButton = tableRowElement.querySelector('button');
            recoverButton.addEventListener('click', function () {
                recoverTimesheet(timesheet.timesheetId);
            });
            tableBodyElement.append(tableRowElement);
        };
        for (var _i = 0, _h = data.timesheets; _i < _h.length; _i++) {
            var timesheet = _h[_i];
            _loop_1(timesheet);
        }
        resultsContainerElement.innerHTML = '';
        resultsContainerElement.append(tableElement);
    }
    function getDeletedRecords() {
        resultsContainerElement.innerHTML = /* html */ "\n      <div class=\"message\">\n        <p class=\"message-body has-text-centered\">\n          <span class=\"icon\"><i class=\"fa-solid fa-spinner fa-spin\"></i></span>\n          <span>Loading...</span>\n        </p>\n      </div>\n    ";
        cityssm.postJSON("".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.timesheetsRouter, "/doGetDeletedTimesheets"), {}, renderDeletedRecordsTable);
    }
    getDeletedRecords();
})();
//# sourceMappingURL=timesheets.recovery.js.map