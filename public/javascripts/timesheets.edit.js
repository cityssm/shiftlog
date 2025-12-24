"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var urlPrefix = "".concat(shiftLog.urlPrefix, "/").concat(shiftLog.timesheetsRouter);
    var formElement = document.querySelector('#form--timesheet');
    var timesheetIdElement = formElement.querySelector('#timesheet--timesheetId');
    var isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1';
    /*
     * Load available shifts based on supervisor and date
     */
    var supervisorElement = formElement.querySelector('#timesheet--supervisorEmployeeNumber');
    var timesheetDateElement = formElement.querySelector('#timesheet--timesheetDateString');
    var shiftIdElement = formElement.querySelector('#timesheet--shiftId');
    function loadAvailableShifts() {
        if (supervisorElement === null || timesheetDateElement === null || shiftIdElement === null) {
            return;
        }
        var supervisorEmployeeNumber = supervisorElement.value;
        var shiftDateString = timesheetDateElement.value;
        if (supervisorEmployeeNumber === '' || shiftDateString === '') {
            // Clear shift dropdown except the "No Shift" option
            shiftIdElement.innerHTML = '<option value="">(No Shift)</option>';
            return;
        }
        cityssm.postJSON("".concat(urlPrefix, "/doGetAvailableShifts"), {
            supervisorEmployeeNumber: supervisorEmployeeNumber,
            shiftDateString: shiftDateString
        }, function (rawResponseJSON) {
            var _a;
            var response = rawResponseJSON;
            if (response.success && response.shifts !== undefined) {
                var currentShiftId = shiftIdElement.value;
                // Rebuild shift dropdown
                shiftIdElement.innerHTML = '<option value="">(No Shift)</option>';
                for (var _i = 0, _b = response.shifts; _i < _b.length; _i++) {
                    var shift = _b[_i];
                    var optionElement = document.createElement('option');
                    optionElement.value = shift.shiftId.toString();
                    optionElement.textContent = "Shift #".concat(shift.shiftId, " - ").concat((_a = shift.shiftTimeDataListItem) !== null && _a !== void 0 ? _a : '', " (").concat(shift.shiftDescription, ")");
                    if (shift.shiftId.toString() === currentShiftId) {
                        optionElement.selected = true;
                    }
                    shiftIdElement.append(optionElement);
                }
            }
        });
    }
    // Load shifts when supervisor or date changes
    if (supervisorElement !== null) {
        supervisorElement.addEventListener('change', loadAvailableShifts);
    }
    if (timesheetDateElement !== null) {
        timesheetDateElement.addEventListener('change', loadAvailableShifts);
    }
    // Load shifts on page load
    if (isCreate && supervisorElement !== null && timesheetDateElement !== null) {
        loadAvailableShifts();
    }
    function doSaveTimesheet(formEvent) {
        formEvent.preventDefault();
        var endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet';
        cityssm.postJSON("".concat(urlPrefix, "/").concat(endpoint), formElement, function (rawResponseJSON) {
            var _a;
            var result = rawResponseJSON;
            if (result.success) {
                if (isCreate) {
                    globalThis.location.href = "".concat(urlPrefix, "/").concat((_a = result.timesheetId) !== null && _a !== void 0 ? _a : '', "/edit");
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Timesheet updated successfully.'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'An error occurred while saving the timesheet.'
                });
            }
        });
    }
    formElement.addEventListener('submit', doSaveTimesheet);
    /*
     * Initialize timesheet grid (edit mode)
     */
    if (!isCreate) {
        var gridContainer = document.querySelector('#timesheet-grid-container');
        if (gridContainer !== null) {
            var timesheetId = Number.parseInt(timesheetIdElement.value, 10);
            var grid_1 = new exports.TimesheetGrid(gridContainer, {
                timesheetId: timesheetId,
                isEditable: true,
                hideEmptyRows: false,
                hideEmptyColumns: false
            });
            // Display options
            var hideEmptyRowsCheckbox_1 = document.querySelector('#display--hideEmptyRows');
            var hideEmptyColumnsCheckbox_1 = document.querySelector('#display--hideEmptyColumns');
            if (hideEmptyRowsCheckbox_1 !== null) {
                hideEmptyRowsCheckbox_1.addEventListener('change', function () {
                    grid_1.setDisplayOptions({ hideEmptyRows: hideEmptyRowsCheckbox_1.checked });
                });
            }
            if (hideEmptyColumnsCheckbox_1 !== null) {
                hideEmptyColumnsCheckbox_1.addEventListener('change', function () {
                    grid_1.setDisplayOptions({ hideEmptyColumns: hideEmptyColumnsCheckbox_1.checked });
                });
            }
            // Initialize grid
            grid_1.init().catch(function (error) {
                console.error('Error initializing grid:', error);
            });
            // Add column button
            var addColumnButton = document.querySelector('#button--addColumn');
            if (addColumnButton !== null) {
                addColumnButton.addEventListener('click', function () {
                    // TODO: Show add column modal
                    console.log('Add column');
                });
            }
            // Add row button
            var addRowButton = document.querySelector('#button--addRow');
            if (addRowButton !== null) {
                addRowButton.addEventListener('click', function () {
                    // TODO: Show add row modal
                    console.log('Add row');
                });
            }
            // Copy from shift button
            var copyFromShiftButton = document.querySelector('#button--copyFromShift');
            if (copyFromShiftButton !== null) {
                copyFromShiftButton.addEventListener('click', function () {
                    // TODO: Show copy from shift modal
                    console.log('Copy from shift');
                });
            }
            // Copy from previous timesheet button
            var copyFromPreviousButton = document.querySelector('#button--copyFromPrevious');
            if (copyFromPreviousButton !== null) {
                copyFromPreviousButton.addEventListener('click', function () {
                    // TODO: Show copy from previous modal
                    console.log('Copy from previous');
                });
            }
        }
    }
})();
