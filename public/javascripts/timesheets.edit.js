(() => {
    const shiftLog = exports.shiftLog;
    const urlPrefix = `${shiftLog.urlPrefix}/${shiftLog.timesheetsRouter}`;
    const formElement = document.querySelector('#form--timesheet');
    const timesheetIdElement = formElement.querySelector('#timesheet--timesheetId');
    const isCreate = timesheetIdElement.value === '' || timesheetIdElement.value === '-1';
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
            // Add column button
            const addColumnButton = document.querySelector('#button--addColumn');
            if (addColumnButton !== null) {
                addColumnButton.addEventListener('click', () => {
                    // TODO: Show add column modal
                    console.log('Add column');
                });
            }
            // Add row button
            const addRowButton = document.querySelector('#button--addRow');
            if (addRowButton !== null) {
                addRowButton.addEventListener('click', () => {
                    // TODO: Show add row modal
                    console.log('Add row');
                });
            }
            // Copy from shift button
            const copyFromShiftButton = document.querySelector('#button--copyFromShift');
            if (copyFromShiftButton !== null) {
                copyFromShiftButton.addEventListener('click', () => {
                    // TODO: Show copy from shift modal
                    console.log('Copy from shift');
                });
            }
            // Copy from previous timesheet button
            const copyFromPreviousButton = document.querySelector('#button--copyFromPrevious');
            if (copyFromPreviousButton !== null) {
                copyFromPreviousButton.addEventListener('click', () => {
                    // TODO: Show copy from previous modal
                    console.log('Copy from previous');
                });
            }
        }
    }
})();
