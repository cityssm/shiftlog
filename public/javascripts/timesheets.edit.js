(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.timesheetsRouter}`;
    const formElement = document.querySelector('#form--timesheet');
    const timesheetIdElement = formElement.querySelector('#timesheet--timesheetId');
    const isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1';
    /*
     * Load available shifts based on supervisor and date
     */
    const supervisorElement = formElement.querySelector('#timesheet--supervisorEmployeeNumber');
    const timesheetDateElement = formElement.querySelector('#timesheet--timesheetDateString');
    const shiftIdElement = formElement.querySelector('#timesheet--shiftId');
    function loadAvailableShifts() {
        if (supervisorElement === null || timesheetDateElement === null || shiftIdElement === null) {
            return;
        }
        const supervisorEmployeeNumber = supervisorElement.value;
        const shiftDateString = timesheetDateElement.value;
        if (supervisorEmployeeNumber === '' || shiftDateString === '') {
            // Clear shift dropdown except the "No Shift" option
            shiftIdElement.innerHTML = '<option value="">(No Shift)</option>';
            return;
        }
        cityssm.postJSON(`${urlPrefix}/doGetAvailableShifts`, {
            supervisorEmployeeNumber,
            shiftDateString
        }, (rawResponseJSON) => {
            const response = rawResponseJSON;
            if (response.success && response.shifts !== undefined) {
                // Check if we have a temporarily stored shift ID (from initial page load)
                const tempShiftId = shiftIdElement.getAttribute('data-temp-shift-id');
                const currentShiftId = tempShiftId ?? shiftIdElement.value;
                // Rebuild shift dropdown
                shiftIdElement.innerHTML = '<option value="">(No Shift)</option>';
                for (const shift of response.shifts) {
                    const optionElement = document.createElement('option');
                    optionElement.value = shift.shiftId.toString();
                    optionElement.textContent = `Shift #${shift.shiftId} - ${shift.shiftTimeDataListItem ?? ''} (${shift.shiftDescription})`;
                    if (shift.shiftId.toString() === currentShiftId) {
                        optionElement.selected = true;
                    }
                    shiftIdElement.append(optionElement);
                }
                // Clear the temporary attribute after first load
                if (tempShiftId !== null) {
                    shiftIdElement.removeAttribute('data-temp-shift-id');
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
        const initialShiftId = shiftIdElement?.getAttribute('data-initial-value') ?? '';
        // Store it temporarily
        if (shiftIdElement !== null && initialShiftId !== '') {
            shiftIdElement.setAttribute('data-temp-shift-id', initialShiftId);
        }
        loadAvailableShifts();
    }
    function doSaveTimesheet(formEvent) {
        formEvent.preventDefault();
        const endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet';
        cityssm.postJSON(`${urlPrefix}/${endpoint}`, formElement, (rawResponseJSON) => {
            const result = rawResponseJSON;
            if (result.success) {
                if (isCreate) {
                    globalThis.location.href = `${urlPrefix}/${result.timesheetId ?? ''}/edit`;
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
        const gridContainer = document.querySelector('#timesheet-grid-container');
        if (gridContainer !== null) {
            const timesheetId = Number.parseInt(timesheetIdElement.value, 10);
            const grid = new exports.TimesheetGrid(gridContainer, {
                timesheetId,
                isEditable: true,
                hideEmptyRows: false,
                hideEmptyColumns: false
            });
            // Display options
            const hideEmptyRowsCheckbox = document.querySelector('#display--hideEmptyRows');
            const hideEmptyColumnsCheckbox = document.querySelector('#display--hideEmptyColumns');
            if (hideEmptyRowsCheckbox !== null) {
                hideEmptyRowsCheckbox.addEventListener('change', () => {
                    grid.setDisplayOptions({ hideEmptyRows: hideEmptyRowsCheckbox.checked });
                });
            }
            if (hideEmptyColumnsCheckbox !== null) {
                hideEmptyColumnsCheckbox.addEventListener('change', () => {
                    grid.setDisplayOptions({ hideEmptyColumns: hideEmptyColumnsCheckbox.checked });
                });
            }
            // Initialize grid
            grid.init().catch((error) => {
                console.error('Error initializing grid:', error);
            });
            // Initialize dropdown
            const dropdownElement = document.querySelector('#dropdown--add');
            if (dropdownElement !== null) {
                const dropdownTrigger = dropdownElement.querySelector('.dropdown-trigger button');
                if (dropdownTrigger !== null) {
                    dropdownTrigger.addEventListener('click', () => {
                        dropdownElement.classList.toggle('is-active');
                    });
                }
                // Close dropdown when clicking outside
                document.addEventListener('click', (event) => {
                    if (!dropdownElement.contains(event.target)) {
                        dropdownElement.classList.remove('is-active');
                    }
                });
            }
            // Add column button
            const addColumnButton = document.querySelector('#button--addColumn');
            if (addColumnButton !== null) {
                addColumnButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    dropdownElement?.classList.remove('is-active');
                    // TODO: Show add column modal
                    console.log('Add column');
                });
            }
            // Add row button
            const addRowButton = document.querySelector('#button--addRow');
            if (addRowButton !== null) {
                addRowButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    dropdownElement?.classList.remove('is-active');
                    // TODO: Show add row modal
                    console.log('Add row');
                });
            }
            // Copy from shift button
            const copyFromShiftButton = document.querySelector('#button--copyFromShift');
            if (copyFromShiftButton !== null) {
                copyFromShiftButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    dropdownElement?.classList.remove('is-active');
                    // TODO: Show copy from shift modal
                    console.log('Copy from shift');
                });
            }
            // Copy from previous timesheet button
            const copyFromPreviousButton = document.querySelector('#button--copyFromPrevious');
            if (copyFromPreviousButton !== null) {
                copyFromPreviousButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    dropdownElement?.classList.remove('is-active');
                    // TODO: Show copy from previous modal
                    console.log('Copy from previous');
                });
            }
        }
    }
})();
