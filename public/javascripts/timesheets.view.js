(() => {
    /*
     * Make form read only
     */
    const formElement = document.querySelector('#form--timesheet');
    formElement?.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    const inputElements = formElement?.querySelectorAll('input, select, textarea');
    inputElements?.forEach((inputElement) => {
        inputElement.disabled = true;
        if (inputElement.tagName.toLowerCase() !== 'select') {
            ;
            inputElement.readOnly = true;
        }
    });
    /*
     * Initialize timesheet grid (view-only mode)
     */
    const gridContainer = document.querySelector('#timesheet-grid-container');
    const timesheetIdInput = document.querySelector('#timesheet--timesheetId');
    if (gridContainer !== null && timesheetIdInput !== null && timesheetIdInput.value !== '') {
        const timesheetId = Number.parseInt(timesheetIdInput.value, 10);
        const grid = new exports.TimesheetGrid(gridContainer, {
            timesheetId,
            isEditable: false,
            hideEmptyRows: false,
            hideEmptyColumns: false,
            filterRows: ''
        });
        // Display options
        const hideEmptyRowsCheckbox = document.querySelector('#display--hideEmptyRows');
        const hideEmptyColumnsCheckbox = document.querySelector('#display--hideEmptyColumns');
        const filterRowsInput = document.querySelector('#display--filterRows');
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
        if (filterRowsInput !== null) {
            filterRowsInput.addEventListener('input', () => {
                grid.setDisplayOptions({ filterRows: filterRowsInput.value });
            });
        }
        // Initialize grid
        grid.init().catch((error) => {
            console.error('Error initializing grid:', error);
        });
    }
})();
export {};
