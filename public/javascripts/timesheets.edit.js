"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var urlPrefix = "".concat(shiftLog.urlPrefix, "/").concat(shiftLog.timesheetsRouter);
    var formElement = document.querySelector('#form--timesheet');
    var timesheetIdElement = formElement.querySelector('#timesheet--timesheetId');
    var isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1';
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
                    // TODO: Show add column modal
                    console.log('Add column');
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
