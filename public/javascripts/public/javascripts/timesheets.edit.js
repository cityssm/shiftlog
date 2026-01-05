(() => {
    var _a;
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
            var _a, _b;
            const response = rawResponseJSON;
            if (response.success && response.shifts !== undefined) {
                // Check if we have a temporarily stored shift ID (from initial page load)
                const tempShiftId = shiftIdElement.dataset.tempShiftId;
                const currentShiftId = tempShiftId !== null && tempShiftId !== void 0 ? tempShiftId : shiftIdElement.value;
                // Rebuild shift dropdown
                shiftIdElement.innerHTML = '<option value="">(No Shift)</option>';
                for (const shift of response.shifts) {
                    const optionElement = document.createElement('option');
                    optionElement.value = shift.shiftId.toString();
                    optionElement.textContent = `Shift #${shift.shiftId} - ${(_a = shift.shiftTimeDataListItem) !== null && _a !== void 0 ? _a : ''} (${(_b = shift.shiftTypeDataListItem) !== null && _b !== void 0 ? _b : ''})`;
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
        const initialShiftId = (_a = shiftIdElement === null || shiftIdElement === void 0 ? void 0 : shiftIdElement.dataset.initialValue) !== null && _a !== void 0 ? _a : '';
        // Store it temporarily
        if (shiftIdElement !== null && initialShiftId !== '') {
            shiftIdElement.dataset.tempShiftId = initialShiftId;
        }
        loadAvailableShifts();
    }
    function doSaveTimesheet(formEvent) {
        formEvent.preventDefault();
        const endpoint = isCreate ? 'doCreateTimesheet' : 'doUpdateTimesheet';
        cityssm.postJSON(`${urlPrefix}/${endpoint}`, formElement, (rawResponseJSON) => {
            var _a;
            const result = rawResponseJSON;
            if (result.success) {
                if (isCreate) {
                    globalThis.location.href = `${urlPrefix}/${(_a = result.timesheetId) !== null && _a !== void 0 ? _a : ''}/edit`;
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
                    dropdownElement === null || dropdownElement === void 0 ? void 0 : dropdownElement.classList.remove('is-active');
                    grid.addColumn();
                });
            }
            // Add row button
            const addRowButton = document.querySelector('#button--addRow');
            if (addRowButton !== null) {
                addRowButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    dropdownElement === null || dropdownElement === void 0 ? void 0 : dropdownElement.classList.remove('is-active');
                    grid.addRow();
                });
            }
            // Copy from shift button
            const copyFromShiftButton = document.querySelector('#button--copyFromShift');
            if (copyFromShiftButton !== null) {
                copyFromShiftButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    dropdownElement === null || dropdownElement === void 0 ? void 0 : dropdownElement.classList.remove('is-active');
                    openCopyFromShiftModal();
                });
            }
            // Copy from previous timesheet button
            const copyFromPreviousButton = document.querySelector('#button--copyFromPrevious');
            if (copyFromPreviousButton !== null) {
                copyFromPreviousButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    dropdownElement === null || dropdownElement === void 0 ? void 0 : dropdownElement.classList.remove('is-active');
                    openCopyFromPreviousTimesheetModal();
                });
            }
            /*
             * Copy from Shift Modal
             */
            function openCopyFromShiftModal() {
                let closeModalFunction;
                cityssm.openHtmlModal('timesheets-copyFromShift', {
                    onshow(modalElement) {
                        var _a, _b, _c;
                        const timesheetId = timesheetIdElement.value;
                        modalElement.querySelector('#copyFromShift--timesheetId').value = timesheetId;
                        const submitButton = modalElement.querySelector('#button--copyFromShift');
                        const listContainer = modalElement.querySelector('#list--shifts');
                        const loadingNotice = modalElement.querySelector('#notice--loading');
                        const noShiftsNotice = modalElement.querySelector('#notice--noShifts');
                        let selectedShiftId = null;
                        // Load available shifts
                        const supervisorEmployeeNumber = (_a = supervisorElement === null || supervisorElement === void 0 ? void 0 : supervisorElement.value) !== null && _a !== void 0 ? _a : '';
                        const shiftDateString = (_b = timesheetDateElement === null || timesheetDateElement === void 0 ? void 0 : timesheetDateElement.value) !== null && _b !== void 0 ? _b : '';
                        cityssm.postJSON(`${urlPrefix}/doGetAvailableShifts`, {
                            supervisorEmployeeNumber,
                            shiftDateString
                        }, (rawResponseJSON) => {
                            var _a, _b, _c, _d;
                            const response = rawResponseJSON;
                            loadingNotice.classList.add('is-hidden');
                            if (response.success && response.shifts !== undefined && response.shifts.length > 0) {
                                listContainer.classList.remove('is-hidden');
                                for (const shift of response.shifts) {
                                    const shiftElement = document.createElement('div');
                                    shiftElement.className = 'box is-clickable mb-2';
                                    shiftElement.dataset.shiftId = shift.shiftId.toString();
                                    shiftElement.innerHTML = `
                      <div class="columns is-mobile is-vcentered">
                        <div class="column">
                          <strong>Shift #${cityssm.escapeHTML(shift.shiftId.toString())}</strong><br />
                          <span class="is-size-7">
                            ${cityssm.escapeHTML((_a = shift.shiftTypeDataListItem) !== null && _a !== void 0 ? _a : '')}<br />
                            ${cityssm.escapeHTML((_b = shift.shiftTimeDataListItem) !== null && _b !== void 0 ? _b : '')}<br />
                            Employees: ${(_c = shift.employeesCount) !== null && _c !== void 0 ? _c : 0}, Equipment: ${(_d = shift.equipmentCount) !== null && _d !== void 0 ? _d : 0}
                          </span>
                        </div>
                        <div class="column is-narrow">
                          <span class="icon is-hidden" data-shift-check>
                            <i class="fa-solid fa-check has-text-success"></i>
                          </span>
                        </div>
                      </div>
                    `;
                                    shiftElement.addEventListener('click', () => {
                                        var _a;
                                        // Deselect all
                                        listContainer.querySelectorAll('.box').forEach((box) => {
                                            var _a;
                                            box.classList.remove('has-background-success-light');
                                            (_a = box.querySelector('[data-shift-check]')) === null || _a === void 0 ? void 0 : _a.classList.add('is-hidden');
                                        });
                                        // Select this one
                                        shiftElement.classList.add('has-background-success-light');
                                        (_a = shiftElement.querySelector('[data-shift-check]')) === null || _a === void 0 ? void 0 : _a.classList.remove('is-hidden');
                                        selectedShiftId = shift.shiftId;
                                        submitButton.disabled = false;
                                    });
                                    listContainer.append(shiftElement);
                                }
                            }
                            else {
                                noShiftsNotice.classList.remove('is-hidden');
                            }
                        });
                        // Handle form submission
                        (_c = modalElement.querySelector('#form--copyFromShift')) === null || _c === void 0 ? void 0 : _c.addEventListener('submit', (formEvent) => {
                            formEvent.preventDefault();
                            if (selectedShiftId === null) {
                                return;
                            }
                            submitButton.disabled = true;
                            cityssm.postJSON(`${urlPrefix}/doCopyFromShift`, {
                                shiftId: selectedShiftId,
                                timesheetId
                            }, (rawResponseJSON) => {
                                const response = rawResponseJSON;
                                if (response.success) {
                                    closeModalFunction();
                                    bulmaJS.alert({
                                        contextualColorName: 'success',
                                        message: 'Successfully copied data from shift.'
                                    });
                                    // Refresh the grid
                                    grid.init().catch((error) => {
                                        console.error('Error reinitializing grid:', error);
                                    });
                                }
                                else {
                                    bulmaJS.alert({
                                        contextualColorName: 'danger',
                                        message: 'An error occurred while copying from shift.'
                                    });
                                    submitButton.disabled = false;
                                }
                            });
                        });
                    },
                    onshown(_modalElement, closeFunction) {
                        closeModalFunction = closeFunction;
                    }
                });
            }
            /*
             * Copy from Previous Timesheet Modal
             */
            function openCopyFromPreviousTimesheetModal() {
                let closeModalFunction;
                cityssm.openHtmlModal('timesheets-copyFromPreviousTimesheet', {
                    onshow(modalElement) {
                        var _a, _b, _c, _d, _e;
                        const timesheetId = timesheetIdElement.value;
                        const timesheetTypeDataListItemId = (_b = (_a = formElement.querySelector('#timesheet--timesheetTypeDataListItemId')) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
                        const supervisorEmployeeNumber = (_c = supervisorElement === null || supervisorElement === void 0 ? void 0 : supervisorElement.value) !== null && _c !== void 0 ? _c : '';
                        modalElement.querySelector('#copyFromPreviousTimesheet--targetTimesheetId').value = timesheetId;
                        modalElement.querySelector('#searchTimesheets--currentTimesheetId').value = timesheetId;
                        const submitButton = modalElement.querySelector('#button--copyFromPreviousTimesheet');
                        const listContainer = modalElement.querySelector('#list--timesheets');
                        const searchResultsContainer = modalElement.querySelector('#container--searchResults');
                        const noTimesheetsNotice = modalElement.querySelector('#notice--noTimesheets');
                        // Populate timesheet type dropdown
                        const timesheetTypeSelect = modalElement.querySelector('#searchTimesheets--timesheetTypeDataListItemId');
                        const originalTimesheetTypeSelect = formElement.querySelector('#timesheet--timesheetTypeDataListItemId');
                        if (originalTimesheetTypeSelect !== null) {
                            Array.from(originalTimesheetTypeSelect.options).forEach((option) => {
                                if (option.value !== '') {
                                    const newOption = document.createElement('option');
                                    newOption.value = option.value;
                                    newOption.textContent = option.textContent;
                                    if (option.value === timesheetTypeDataListItemId) {
                                        newOption.selected = true;
                                    }
                                    timesheetTypeSelect.append(newOption);
                                }
                            });
                        }
                        // Populate supervisor dropdown
                        const supervisorSelect = modalElement.querySelector('#searchTimesheets--supervisorEmployeeNumber');
                        const originalSupervisorSelect = formElement.querySelector('#timesheet--supervisorEmployeeNumber');
                        if (originalSupervisorSelect !== null) {
                            Array.from(originalSupervisorSelect.options).forEach((option) => {
                                if (option.value !== '') {
                                    const newOption = document.createElement('option');
                                    newOption.value = option.value;
                                    newOption.textContent = option.textContent;
                                    if (option.value === supervisorEmployeeNumber) {
                                        newOption.selected = true;
                                    }
                                    supervisorSelect.append(newOption);
                                }
                            });
                        }
                        let selectedTimesheetId = null;
                        // Search form submission
                        (_d = modalElement.querySelector('#form--searchTimesheets')) === null || _d === void 0 ? void 0 : _d.addEventListener('submit', (formEvent) => {
                            var _a, _b;
                            formEvent.preventDefault();
                            const searchForm = formEvent.currentTarget;
                            const searchData = new FormData(searchForm);
                            // Clear previous results
                            listContainer.innerHTML = '';
                            selectedTimesheetId = null;
                            submitButton.disabled = true;
                            cityssm.postJSON(`${urlPrefix}/doSearchTimesheets`, {
                                timesheetTypeDataListItemId: (_a = searchData.get('timesheetTypeDataListItemId')) !== null && _a !== void 0 ? _a : '',
                                supervisorEmployeeNumber: (_b = searchData.get('supervisorEmployeeNumber')) !== null && _b !== void 0 ? _b : '',
                                limit: 20,
                                offset: 0
                            }, (rawResponseJSON) => {
                                var _a, _b, _c;
                                const response = rawResponseJSON;
                                searchResultsContainer.classList.remove('is-hidden');
                                if (response.success && response.timesheets !== undefined && response.timesheets.length > 0) {
                                    // Filter out the current timesheet
                                    const filteredTimesheets = response.timesheets.filter((t) => t.timesheetId.toString() !== timesheetId);
                                    if (filteredTimesheets.length === 0) {
                                        noTimesheetsNotice.classList.remove('is-hidden');
                                        return;
                                    }
                                    noTimesheetsNotice.classList.add('is-hidden');
                                    for (const timesheet of filteredTimesheets) {
                                        const timesheetElement = document.createElement('div');
                                        timesheetElement.className = 'box is-clickable mb-2';
                                        timesheetElement.dataset.timesheetId = timesheet.timesheetId.toString();
                                        const dateString = new Date(timesheet.timesheetDate).toLocaleDateString();
                                        const supervisorName = `${(_a = timesheet.supervisorLastName) !== null && _a !== void 0 ? _a : ''}, ${(_b = timesheet.supervisorFirstName) !== null && _b !== void 0 ? _b : ''}`;
                                        timesheetElement.innerHTML = `
                        <div class="columns is-mobile is-vcentered">
                          <div class="column">
                            <strong>Timesheet #${cityssm.escapeHTML(timesheet.timesheetId.toString())}</strong><br />
                            <span class="is-size-7">
                              ${cityssm.escapeHTML((_c = timesheet.timesheetTypeDataListItem) !== null && _c !== void 0 ? _c : '')}<br />
                              ${cityssm.escapeHTML(dateString)}<br />
                              Supervisor: ${cityssm.escapeHTML(supervisorName)}<br />
                              ${timesheet.timesheetTitle ? cityssm.escapeHTML(timesheet.timesheetTitle) : ''}
                            </span>
                          </div>
                          <div class="column is-narrow">
                            <span class="icon is-hidden" data-timesheet-check>
                              <i class="fa-solid fa-check has-text-success"></i>
                            </span>
                          </div>
                        </div>
                      `;
                                        timesheetElement.addEventListener('click', () => {
                                            var _a;
                                            // Deselect all
                                            listContainer.querySelectorAll('.box').forEach((box) => {
                                                var _a;
                                                box.classList.remove('has-background-success-light');
                                                (_a = box.querySelector('[data-timesheet-check]')) === null || _a === void 0 ? void 0 : _a.classList.add('is-hidden');
                                            });
                                            // Select this one
                                            timesheetElement.classList.add('has-background-success-light');
                                            (_a = timesheetElement.querySelector('[data-timesheet-check]')) === null || _a === void 0 ? void 0 : _a.classList.remove('is-hidden');
                                            selectedTimesheetId = timesheet.timesheetId;
                                            modalElement.querySelector('#copyFromPreviousTimesheet--sourceTimesheetId').value = timesheet.timesheetId.toString();
                                            submitButton.disabled = false;
                                        });
                                        listContainer.append(timesheetElement);
                                    }
                                }
                                else {
                                    noTimesheetsNotice.classList.remove('is-hidden');
                                }
                            });
                        });
                        // Handle copy form submission
                        (_e = modalElement.querySelector('#form--copyFromPreviousTimesheet')) === null || _e === void 0 ? void 0 : _e.addEventListener('submit', (formEvent) => {
                            formEvent.preventDefault();
                            if (selectedTimesheetId === null) {
                                return;
                            }
                            submitButton.disabled = true;
                            cityssm.postJSON(`${urlPrefix}/doCopyFromPreviousTimesheet`, {
                                sourceTimesheetId: selectedTimesheetId,
                                targetTimesheetId: timesheetId
                            }, (rawResponseJSON) => {
                                const response = rawResponseJSON;
                                if (response.success) {
                                    closeModalFunction();
                                    bulmaJS.alert({
                                        contextualColorName: 'success',
                                        message: 'Successfully copied data from previous timesheet.'
                                    });
                                    // Refresh the grid
                                    grid.init().catch((error) => {
                                        console.error('Error reinitializing grid:', error);
                                    });
                                }
                                else {
                                    bulmaJS.alert({
                                        contextualColorName: 'danger',
                                        message: 'An error occurred while copying from previous timesheet.'
                                    });
                                    submitButton.disabled = false;
                                }
                            });
                        });
                    },
                    onshown(_modalElement, closeFunction) {
                        closeModalFunction = closeFunction;
                    }
                });
            }
        }
    }
})();
export {};
