"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
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
            var _a, _b;
            var response = rawResponseJSON;
            if (response.success && response.shifts !== undefined) {
                // Check if we have a temporarily stored shift ID (from initial page load)
                var tempShiftId = shiftIdElement.dataset.tempShiftId;
                var currentShiftId = tempShiftId !== null && tempShiftId !== void 0 ? tempShiftId : shiftIdElement.value;
                // Rebuild shift dropdown
                shiftIdElement.innerHTML = '<option value="">(No Shift)</option>';
                for (var _i = 0, _c = response.shifts; _i < _c.length; _i++) {
                    var shift = _c[_i];
                    var optionElement = document.createElement('option');
                    optionElement.value = shift.shiftId.toString();
                    optionElement.textContent = "Shift #".concat(shift.shiftId, " - ").concat((_a = shift.shiftTimeDataListItem) !== null && _a !== void 0 ? _a : '', " (").concat((_b = shift.shiftTypeDataListItem) !== null && _b !== void 0 ? _b : '', ")");
                    if (shift.shiftId.toString() === currentShiftId) {
                        optionElement.selected = true;
                    }
                    shiftIdElement.append(optionElement);
                }
                // Clear the temporary attribute after first load
                if (tempShiftId !== null) {
                    delete shiftIdElement.dataset.tempShiftId;
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
    // Load shifts on page load (for both create and edit modes)
    if (supervisorElement !== null && timesheetDateElement !== null) {
        // Get initial shift ID from data attribute
        var initialShiftId = (_a = shiftIdElement === null || shiftIdElement === void 0 ? void 0 : shiftIdElement.dataset.initialValue) !== null && _a !== void 0 ? _a : '';
        // Store it temporarily
        if (shiftIdElement !== null && initialShiftId !== '') {
            shiftIdElement.dataset.tempShiftId = initialShiftId;
        }
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
            // Initialize dropdown
            var dropdownElement_1 = document.querySelector('#dropdown--add');
            if (dropdownElement_1 !== null) {
                var dropdownTrigger = dropdownElement_1.querySelector('.dropdown-trigger button');
                if (dropdownTrigger !== null) {
                    dropdownTrigger.addEventListener('click', function () {
                        dropdownElement_1.classList.toggle('is-active');
                    });
                }
                // Close dropdown when clicking outside
                document.addEventListener('click', function (event) {
                    if (!dropdownElement_1.contains(event.target)) {
                        dropdownElement_1.classList.remove('is-active');
                    }
                });
            }
            // Add column button
            var addColumnButton = document.querySelector('#button--addColumn');
            if (addColumnButton !== null) {
                addColumnButton.addEventListener('click', function (event) {
                    event.preventDefault();
                    dropdownElement_1 === null || dropdownElement_1 === void 0 ? void 0 : dropdownElement_1.classList.remove('is-active');
                    grid_1.addColumn();
                });
            }
            // Add row button
            var addRowButton = document.querySelector('#button--addRow');
            if (addRowButton !== null) {
                addRowButton.addEventListener('click', function (event) {
                    event.preventDefault();
                    dropdownElement_1 === null || dropdownElement_1 === void 0 ? void 0 : dropdownElement_1.classList.remove('is-active');
                    // TODO: Show add row modal
                    console.log('Add row');
                });
            }
            // Copy from shift button
            var copyFromShiftButton = document.querySelector('#button--copyFromShift');
            if (copyFromShiftButton !== null) {
                copyFromShiftButton.addEventListener('click', function (event) {
                    event.preventDefault();
                    dropdownElement_1 === null || dropdownElement_1 === void 0 ? void 0 : dropdownElement_1.classList.remove('is-active');
                    // TODO: Show copy from shift modal
                    console.log('Copy from shift');
                });
            }
            // Copy from previous timesheet button
            var copyFromPreviousButton = document.querySelector('#button--copyFromPrevious');
            if (copyFromPreviousButton !== null) {
                copyFromPreviousButton.addEventListener('click', function (event) {
                    event.preventDefault();
                    dropdownElement_1 === null || dropdownElement_1 === void 0 ? void 0 : dropdownElement_1.classList.remove('is-active');
                    // TODO: Show copy from previous modal
                    console.log('Copy from previous');
                });
            }
        }
    }
})();
