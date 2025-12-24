class TimesheetGrid {
    config;
    columns = [];
    rows = [];
    cells = new Map();
    containerElement;
    shiftLog;
    constructor(containerElement, config) {
        this.containerElement = containerElement;
        this.config = config;
        this.shiftLog = exports.shiftLog;
    }
    getCellKey(rowId, columnId) {
        return `${rowId}_${columnId}`;
    }
    getCellHours(rowId, columnId) {
        const key = this.getCellKey(rowId, columnId);
        return this.cells.get(key)?.recordHours ?? 0;
    }
    setCellHours(rowId, columnId, hours) {
        const key = this.getCellKey(rowId, columnId);
        if (hours === 0) {
            this.cells.delete(key);
        }
        else {
            this.cells.set(key, {
                timesheetRowId: rowId,
                timesheetColumnId: columnId,
                recordHours: hours,
                mappingConfidence: 0
            });
        }
    }
    getRowTotal(rowId) {
        let total = 0;
        for (const column of this.columns) {
            total += this.getCellHours(rowId, column.timesheetColumnId);
        }
        return total;
    }
    getColumnTotal(columnId) {
        let total = 0;
        for (const row of this.rows) {
            total += this.getCellHours(row.timesheetRowId, columnId);
        }
        return total;
    }
    shouldShowRow(row) {
        if (!this.config.hideEmptyRows) {
            return true;
        }
        return this.getRowTotal(row.timesheetRowId) > 0;
    }
    shouldShowColumn(column) {
        if (!this.config.hideEmptyColumns) {
            return true;
        }
        return this.getColumnTotal(column.timesheetColumnId) > 0;
    }
    loadData() {
        const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`;
        return new Promise((resolve, reject) => {
            // Load columns
            cityssm.postJSON(`${timesheetUrlPrefix}/doGetTimesheetColumns`, { timesheetId: this.config.timesheetId }, (rawResponseJSON) => {
                const columnsData = rawResponseJSON;
                this.columns = columnsData.columns;
                // Load rows
                cityssm.postJSON(`${timesheetUrlPrefix}/doGetTimesheetRows`, { timesheetId: this.config.timesheetId }, (rawResponseJSON) => {
                    const rowsData = rawResponseJSON;
                    this.rows = rowsData.rows;
                    // Load cells
                    cityssm.postJSON(`${timesheetUrlPrefix}/doGetTimesheetCells`, { timesheetId: this.config.timesheetId }, (rawResponseJSON) => {
                        const cellsData = rawResponseJSON;
                        this.cells.clear();
                        for (const cell of cellsData.cells) {
                            const key = this.getCellKey(cell.timesheetRowId, cell.timesheetColumnId);
                            this.cells.set(key, cell);
                        }
                        resolve();
                    });
                });
            });
        });
    }
    createCellElement(row, column) {
        const td = document.createElement('td');
        td.className = 'timesheet-cell';
        const hours = this.getCellHours(row.timesheetRowId, column.timesheetColumnId);
        if (this.config.isEditable) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'input is-small';
            input.step = '0.25';
            input.min = '0';
            input.value = hours > 0 ? hours.toString() : '';
            input.placeholder = '0';
            input.style.width = '80px';
            input.style.textAlign = 'right';
            input.addEventListener('change', () => {
                const newHours = input.value === '' ? 0 : Number.parseFloat(input.value);
                this.updateCell(row.timesheetRowId, column.timesheetColumnId, newHours);
                this.render();
            });
            td.append(input);
        }
        else {
            td.textContent = hours > 0 ? hours.toString() : '';
            td.style.textAlign = 'right';
        }
        return td;
    }
    updateCell(rowId, columnId, hours) {
        const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`;
        cityssm.postJSON(`${timesheetUrlPrefix}/doUpdateTimesheetCell`, {
            timesheetRowId: rowId,
            timesheetColumnId: columnId,
            recordHours: hours
        }, (rawResponseJSON) => {
            const result = rawResponseJSON;
            if (result.success) {
                this.setCellHours(rowId, columnId, hours);
            }
            else {
                bulmaJS.alert({
                    title: 'Error',
                    message: 'Failed to update cell',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    render() {
        const visibleColumns = this.columns.filter(col => this.shouldShowColumn(col));
        const visibleRows = this.rows.filter(row => this.shouldShowRow(row));
        // Create table
        const table = document.createElement('table');
        table.className = 'table is-bordered is-striped is-hoverable is-fullwidth timesheet-grid';
        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        // First column is for row labels
        const thCorner = document.createElement('th');
        thCorner.textContent = 'Employee / Equipment';
        thCorner.style.minWidth = '200px';
        headerRow.append(thCorner);
        // Column headers
        for (const column of visibleColumns) {
            const th = document.createElement('th');
            th.textContent = column.columnTitle;
            th.style.minWidth = '100px';
            th.style.textAlign = 'center';
            const columnTotal = this.getColumnTotal(column.timesheetColumnId);
            if (columnTotal === 0) {
                th.classList.add('has-background-warning-light');
            }
            if (column.workOrderNumber) {
                const small = document.createElement('small');
                small.className = 'is-block has-text-grey';
                small.textContent = `WO: ${column.workOrderNumber}`;
                th.append(document.createElement('br'), small);
            }
            if (this.config.isEditable) {
                const columnActions = document.createElement('div');
                columnActions.className = 'buttons are-small is-centered mt-2';
                const editButton = document.createElement('button');
                editButton.className = 'button is-info is-small';
                editButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
                editButton.title = 'Edit Column';
                editButton.addEventListener('click', () => this.editColumn(column));
                const deleteButton = document.createElement('button');
                deleteButton.className = 'button is-danger is-small';
                deleteButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>';
                deleteButton.title = 'Delete Column';
                deleteButton.addEventListener('click', () => this.deleteColumn(column));
                columnActions.append(editButton, deleteButton);
                th.append(columnActions);
            }
            headerRow.append(th);
        }
        // Total column
        const thTotal = document.createElement('th');
        thTotal.textContent = 'Total Hours';
        thTotal.style.textAlign = 'center';
        thTotal.style.fontWeight = 'bold';
        headerRow.append(thTotal);
        thead.append(headerRow);
        table.append(thead);
        // Create body
        const tbody = document.createElement('tbody');
        for (const row of visibleRows) {
            const tr = document.createElement('tr');
            // Row label
            const tdLabel = document.createElement('td');
            tdLabel.className = 'timesheet-row-label';
            const rowTitle = document.createElement('strong');
            rowTitle.textContent = row.rowTitle;
            tdLabel.append(rowTitle);
            if (row.employeeNumber) {
                const employeeInfo = document.createElement('small');
                employeeInfo.className = 'is-block has-text-grey';
                employeeInfo.textContent = `Employee: ${row.employeeNumber}`;
                tdLabel.append(document.createElement('br'), employeeInfo);
            }
            if (row.equipmentNumber) {
                const equipmentInfo = document.createElement('small');
                equipmentInfo.className = 'is-block has-text-grey';
                equipmentInfo.textContent = `Equipment: ${row.equipmentNumber}`;
                tdLabel.append(document.createElement('br'), equipmentInfo);
            }
            if (this.config.isEditable) {
                const rowActions = document.createElement('div');
                rowActions.className = 'buttons are-small mt-2';
                const editButton = document.createElement('button');
                editButton.className = 'button is-info is-small';
                editButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
                editButton.title = 'Edit Row';
                editButton.addEventListener('click', () => this.editRow(row));
                const deleteButton = document.createElement('button');
                deleteButton.className = 'button is-danger is-small';
                deleteButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>';
                deleteButton.title = 'Delete Row';
                deleteButton.addEventListener('click', () => this.deleteRow(row));
                rowActions.append(editButton, deleteButton);
                tdLabel.append(rowActions);
            }
            tr.append(tdLabel);
            // Create cells for each column
            for (const column of visibleColumns) {
                const td = this.createCellElement(row, column);
                tr.append(td);
            }
            // Total cell
            const tdTotal = document.createElement('td');
            const rowTotal = this.getRowTotal(row.timesheetRowId);
            tdTotal.textContent = rowTotal.toString();
            tdTotal.style.textAlign = 'right';
            tdTotal.style.fontWeight = 'bold';
            if (rowTotal === 0) {
                tdTotal.classList.add('has-background-warning-light');
            }
            tr.append(tdTotal);
            tbody.append(tr);
        }
        table.append(tbody);
        // Clear container and add table
        this.containerElement.innerHTML = '';
        this.containerElement.append(table);
    }
    editColumn(column) {
        // TODO: Implement column edit modal
        console.log('Edit column', column);
    }
    deleteColumn(column) {
        bulmaJS.confirm({
            title: 'Delete Column',
            message: 'Are you sure you want to delete this column? All associated hours will be lost.',
            contextualColorName: 'danger',
            okButton: {
                text: 'Delete',
                callbackFunction: () => {
                    const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`;
                    cityssm.postJSON(`${timesheetUrlPrefix}/doDeleteTimesheetColumn`, {
                        timesheetColumnId: column.timesheetColumnId
                    }, (rawResponseJSON) => {
                        const result = rawResponseJSON;
                        if (result.success) {
                            this.loadData().then(() => {
                                this.render();
                            }).catch((error) => {
                                console.error('Error reloading data:', error);
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error',
                                message: 'Failed to delete column',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
            }
        });
    }
    editRow(row) {
        // TODO: Implement row edit modal
        console.log('Edit row', row);
    }
    deleteRow(row) {
        bulmaJS.confirm({
            title: 'Delete Row',
            message: 'Are you sure you want to delete this row? All associated hours will be lost.',
            contextualColorName: 'danger',
            okButton: {
                text: 'Delete',
                callbackFunction: () => {
                    const timesheetUrlPrefix = `${this.shiftLog.urlPrefix}/${this.shiftLog.timesheetsRouter}`;
                    cityssm.postJSON(`${timesheetUrlPrefix}/doDeleteTimesheetRow`, {
                        timesheetRowId: row.timesheetRowId
                    }, (rawResponseJSON) => {
                        const result = rawResponseJSON;
                        if (result.success) {
                            this.loadData().then(() => {
                                this.render();
                            }).catch((error) => {
                                console.error('Error reloading data:', error);
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error',
                                message: 'Failed to delete row',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
            }
        });
    }
    async init() {
        await this.loadData();
        this.render();
    }
    setDisplayOptions(options) {
        if (options.hideEmptyRows !== undefined) {
            this.config.hideEmptyRows = options.hideEmptyRows;
        }
        if (options.hideEmptyColumns !== undefined) {
            this.config.hideEmptyColumns = options.hideEmptyColumns;
        }
        this.render();
    }
}
// Add to exports for use in other scripts
exports.TimesheetGrid = TimesheetGrid;
