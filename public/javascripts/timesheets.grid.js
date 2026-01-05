"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var TimesheetGrid = /** @class */ (function () {
    function TimesheetGrid(containerElement, config) {
        this.columns = [];
        this.rows = [];
        this.cells = new Map();
        this.containerElement = containerElement;
        this.config = config;
        this.shiftLog = exports.shiftLog;
    }
    TimesheetGrid.prototype.getCellKey = function (rowId, columnId) {
        return "".concat(rowId, "_").concat(columnId);
    };
    TimesheetGrid.prototype.getCellHours = function (rowId, columnId) {
        var _a, _b;
        var key = this.getCellKey(rowId, columnId);
        return (_b = (_a = this.cells.get(key)) === null || _a === void 0 ? void 0 : _a.recordHours) !== null && _b !== void 0 ? _b : 0;
    };
    TimesheetGrid.prototype.setCellHours = function (rowId, columnId, hours) {
        var key = this.getCellKey(rowId, columnId);
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
    };
    TimesheetGrid.prototype.getRowTotal = function (rowId) {
        var total = 0;
        for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
            var column = _a[_i];
            total += this.getCellHours(rowId, column.timesheetColumnId);
        }
        return total;
    };
    TimesheetGrid.prototype.getColumnTotal = function (columnId) {
        var total = 0;
        for (var _i = 0, _a = this.rows; _i < _a.length; _i++) {
            var row = _a[_i];
            total += this.getCellHours(row.timesheetRowId, columnId);
        }
        return total;
    };
    TimesheetGrid.prototype.shouldShowRow = function (row) {
        if (!this.config.hideEmptyRows) {
            return true;
        }
        return this.getRowTotal(row.timesheetRowId) > 0;
    };
    TimesheetGrid.prototype.shouldShowColumn = function (column) {
        if (!this.config.hideEmptyColumns) {
            return true;
        }
        return this.getColumnTotal(column.timesheetColumnId) > 0;
    };
    TimesheetGrid.prototype.loadData = function () {
        var _this = this;
        var timesheetUrlPrefix = "".concat(this.shiftLog.urlPrefix, "/").concat(this.shiftLog.timesheetsRouter);
        return new Promise(function (resolve, reject) {
            // Load columns
            cityssm.postJSON("".concat(timesheetUrlPrefix, "/doGetTimesheetColumns"), { timesheetId: _this.config.timesheetId }, function (rawResponseJSON) {
                var columnsData = rawResponseJSON;
                _this.columns = columnsData.columns;
                // Load rows
                cityssm.postJSON("".concat(timesheetUrlPrefix, "/doGetTimesheetRows"), { timesheetId: _this.config.timesheetId }, function (rawResponseJSON) {
                    var rowsData = rawResponseJSON;
                    _this.rows = rowsData.rows;
                    // Load cells
                    cityssm.postJSON("".concat(timesheetUrlPrefix, "/doGetTimesheetCells"), { timesheetId: _this.config.timesheetId }, function (rawResponseJSON) {
                        var cellsData = rawResponseJSON;
                        _this.cells.clear();
                        for (var _i = 0, _a = cellsData.cells; _i < _a.length; _i++) {
                            var cell = _a[_i];
                            var key = _this.getCellKey(cell.timesheetRowId, cell.timesheetColumnId);
                            _this.cells.set(key, cell);
                        }
                        resolve();
                    });
                });
            });
        });
    };
    TimesheetGrid.prototype.createCellElement = function (row, column) {
        var _this = this;
        var td = document.createElement('td');
        td.className = 'timesheet-cell';
        var hours = this.getCellHours(row.timesheetRowId, column.timesheetColumnId);
        if (this.config.isEditable) {
            var input_1 = document.createElement('input');
            input_1.type = 'number';
            input_1.className = 'input is-small';
            input_1.step = '0.25';
            input_1.min = '0';
            input_1.value = hours > 0 ? hours.toString() : '';
            input_1.placeholder = '0';
            input_1.style.width = '80px';
            input_1.style.textAlign = 'right';
            input_1.addEventListener('change', function () {
                var newHours = input_1.value === '' ? 0 : Number.parseFloat(input_1.value);
                _this.updateCell(row.timesheetRowId, column.timesheetColumnId, newHours);
                _this.render();
            });
            td.append(input_1);
        }
        else {
            td.textContent = hours > 0 ? hours.toString() : '';
            td.style.textAlign = 'right';
        }
        return td;
    };
    TimesheetGrid.prototype.updateCell = function (rowId, columnId, hours) {
        var _this = this;
        var timesheetUrlPrefix = "".concat(this.shiftLog.urlPrefix, "/").concat(this.shiftLog.timesheetsRouter);
        cityssm.postJSON("".concat(timesheetUrlPrefix, "/doUpdateTimesheetCell"), {
            timesheetRowId: rowId,
            timesheetColumnId: columnId,
            recordHours: hours
        }, function (rawResponseJSON) {
            var result = rawResponseJSON;
            if (result.success) {
                _this.setCellHours(rowId, columnId, hours);
            }
            else {
                bulmaJS.alert({
                    title: 'Error',
                    message: 'Failed to update cell',
                    contextualColorName: 'danger'
                });
            }
        });
    };
    TimesheetGrid.prototype.render = function () {
        var _this = this;
        var visibleColumns = this.columns.filter(function (col) { return _this.shouldShowColumn(col); });
        var visibleRows = this.rows.filter(function (row) { return _this.shouldShowRow(row); });
        // Create table
        var table = document.createElement('table');
        table.className = 'table is-bordered is-striped is-hoverable is-fullwidth timesheet-grid';
        // Create header
        var thead = document.createElement('thead');
        var headerRow = document.createElement('tr');
        // First column is for row labels
        var thCorner = document.createElement('th');
        thCorner.style.minWidth = '200px';
        var cornerTitle = document.createElement('div');
        cornerTitle.textContent = 'Employee / Equipment';
        thCorner.append(cornerTitle);
        if (this.config.isEditable) {
            var addRowButton = document.createElement('button');
            addRowButton.className = 'button is-primary is-small mt-2';
            addRowButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span><span>Add</span>';
            addRowButton.title = 'Add Row';
            addRowButton.addEventListener('click', function () {
                // Trigger the add row button in the toolbar
                var addRowToolbarButton = document.querySelector('#button--addRow');
                if (addRowToolbarButton !== null) {
                    addRowToolbarButton.click();
                }
            });
            thCorner.append(addRowButton);
        }
        headerRow.append(thCorner);
        var _loop_1 = function (colIndex) {
            var column = visibleColumns[colIndex];
            var th = document.createElement('th');
            th.textContent = column.columnTitle;
            th.style.minWidth = '100px';
            th.style.textAlign = 'center';
            var columnTotal = this_1.getColumnTotal(column.timesheetColumnId);
            if (columnTotal === 0) {
                th.classList.add('has-background-warning-light');
            }
            if (column.workOrderNumber) {
                var small = document.createElement('small');
                small.className = 'is-block has-text-grey';
                small.textContent = "WO: ".concat(column.workOrderNumber);
                th.append(document.createElement('br'), small);
            }
            if (this_1.config.isEditable) {
                var columnActions = document.createElement('div');
                columnActions.className = 'buttons are-small is-centered mt-2';
                // Move left button (only if not first column)
                if (colIndex > 0) {
                    var moveLeftButton = document.createElement('button');
                    moveLeftButton.className = 'button is-light is-small';
                    moveLeftButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-arrow-left"></i></span>';
                    moveLeftButton.title = 'Move Left';
                    moveLeftButton.addEventListener('click', function () { return _this.moveColumn(column, 'left'); });
                    columnActions.append(moveLeftButton);
                }
                // Move right button (only if not last column)
                if (colIndex < visibleColumns.length - 1) {
                    var moveRightButton = document.createElement('button');
                    moveRightButton.className = 'button is-light is-small';
                    moveRightButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-arrow-right"></i></span>';
                    moveRightButton.title = 'Move Right';
                    moveRightButton.addEventListener('click', function () { return _this.moveColumn(column, 'right'); });
                    columnActions.append(moveRightButton);
                }
                var editButton = document.createElement('button');
                editButton.className = 'button is-info is-small';
                editButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
                editButton.title = 'Edit Column';
                editButton.addEventListener('click', function () { return _this.editColumn(column); });
                var deleteButton = document.createElement('button');
                deleteButton.className = 'button is-danger is-small';
                deleteButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>';
                deleteButton.title = 'Delete Column';
                deleteButton.addEventListener('click', function () { return _this.deleteColumn(column); });
                columnActions.append(editButton, deleteButton);
                th.append(columnActions);
            }
            headerRow.append(th);
        };
        var this_1 = this;
        // Column headers
        for (var colIndex = 0; colIndex < visibleColumns.length; colIndex++) {
            _loop_1(colIndex);
        }
        // Add column header (before Total Hours)
        if (this.config.isEditable) {
            var thAddColumn = document.createElement('th');
            thAddColumn.style.width = '80px';
            thAddColumn.style.textAlign = 'center';
            var addColumnButton = document.createElement('button');
            addColumnButton.className = 'button is-primary is-small';
            addColumnButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-plus"></i></span><span>Add</span>';
            addColumnButton.title = 'Add Column';
            addColumnButton.addEventListener('click', function () {
                // Trigger the add column button in the toolbar
                var addColumnToolbarButton = document.querySelector('#button--addColumn');
                if (addColumnToolbarButton !== null) {
                    addColumnToolbarButton.click();
                }
            });
            thAddColumn.append(addColumnButton);
            headerRow.append(thAddColumn);
        }
        // Total column
        var thTotal = document.createElement('th');
        thTotal.textContent = 'Total Hours';
        thTotal.style.textAlign = 'center';
        thTotal.style.fontWeight = 'bold';
        headerRow.append(thTotal);
        thead.append(headerRow);
        table.append(thead);
        // Create body
        var tbody = document.createElement('tbody');
        var _loop_2 = function (row) {
            var tr = document.createElement('tr');
            // Row label
            var tdLabel = document.createElement('td');
            tdLabel.className = 'timesheet-row-label';
            var rowTitle = document.createElement('strong');
            rowTitle.textContent = row.rowTitle;
            tdLabel.append(rowTitle);
            if (row.employeeNumber) {
                var employeeInfo = document.createElement('small');
                employeeInfo.className = 'is-block has-text-grey';
                employeeInfo.textContent = "Employee: ".concat(row.employeeNumber);
                tdLabel.append(document.createElement('br'), employeeInfo);
            }
            if (row.equipmentNumber) {
                var equipmentInfo = document.createElement('small');
                equipmentInfo.className = 'is-block has-text-grey';
                equipmentInfo.textContent = "Equipment: ".concat(row.equipmentNumber);
                tdLabel.append(document.createElement('br'), equipmentInfo);
            }
            if (this_2.config.isEditable) {
                var rowActions = document.createElement('div');
                rowActions.className = 'buttons are-small mt-2';
                var editButton = document.createElement('button');
                editButton.className = 'button is-info is-small';
                editButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-edit"></i></span>';
                editButton.title = 'Edit Row';
                editButton.addEventListener('click', function () { return _this.editRow(row); });
                var deleteButton = document.createElement('button');
                deleteButton.className = 'button is-danger is-small';
                deleteButton.innerHTML = '<span class="icon is-small"><i class="fa-solid fa-trash"></i></span>';
                deleteButton.title = 'Delete Row';
                deleteButton.addEventListener('click', function () { return _this.deleteRow(row); });
                rowActions.append(editButton, deleteButton);
                tdLabel.append(rowActions);
            }
            tr.append(tdLabel);
            // Create cells for each column
            for (var _a = 0, visibleColumns_1 = visibleColumns; _a < visibleColumns_1.length; _a++) {
                var column = visibleColumns_1[_a];
                var td = this_2.createCellElement(row, column);
                tr.append(td);
            }
            // Empty cell for the add column header (if editable)
            if (this_2.config.isEditable) {
                var tdEmpty = document.createElement('td');
                tdEmpty.className = 'has-background-light';
                tr.append(tdEmpty);
            }
            // Total cell
            var tdTotal = document.createElement('td');
            var rowTotal = this_2.getRowTotal(row.timesheetRowId);
            tdTotal.textContent = rowTotal.toString();
            tdTotal.style.textAlign = 'right';
            tdTotal.style.fontWeight = 'bold';
            if (rowTotal === 0) {
                tdTotal.classList.add('has-background-warning-light');
            }
            tr.append(tdTotal);
            tbody.append(tr);
        };
        var this_2 = this;
        for (var _i = 0, visibleRows_1 = visibleRows; _i < visibleRows_1.length; _i++) {
            var row = visibleRows_1[_i];
            _loop_2(row);
        }
        table.append(tbody);
        // Clear container and add table
        this.containerElement.innerHTML = '';
        this.containerElement.append(table);
    };
    TimesheetGrid.prototype.editColumn = function (column) {
        var _this = this;
        var closeModalFunction;
        var doUpdateColumn = function (submitEvent) {
            submitEvent.preventDefault();
            var editForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(_this.shiftLog.urlPrefix, "/").concat(_this.shiftLog.timesheetsRouter, "/doUpdateTimesheetColumn"), editForm, function (rawResponseJSON) {
                var result = rawResponseJSON;
                if (result.success) {
                    closeModalFunction();
                    _this.loadData().then(function () {
                        _this.render();
                    }).catch(function (error) {
                        console.error('Error reloading data:', error);
                    });
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Column Updated',
                        message: 'The column has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Column',
                        message: 'Please try again.'
                    });
                }
            });
        };
        cityssm.openHtmlModal('timesheets-editColumn', {
            onshow: function (modalElement) {
                var _a, _b, _c, _d;
                // Set form values
                ;
                modalElement.querySelector('#editTimesheetColumn--timesheetColumnId').value = column.timesheetColumnId.toString();
                modalElement.querySelector('#editTimesheetColumn--columnTitle').value = column.columnTitle;
                modalElement.querySelector('#editTimesheetColumn--workOrderNumber').value = (_a = column.workOrderNumber) !== null && _a !== void 0 ? _a : '';
                modalElement.querySelector('#editTimesheetColumn--costCenterA').value = (_b = column.costCenterA) !== null && _b !== void 0 ? _b : '';
                modalElement.querySelector('#editTimesheetColumn--costCenterB').value = (_c = column.costCenterB) !== null && _c !== void 0 ? _c : '';
                // Attach form submit handler
                (_d = modalElement.querySelector('form')) === null || _d === void 0 ? void 0 : _d.addEventListener('submit', doUpdateColumn);
            },
            onshown: function (_modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    };
    TimesheetGrid.prototype.addColumn = function () {
        var _this = this;
        var closeModalFunction;
        var doAddColumn = function (submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(_this.shiftLog.urlPrefix, "/").concat(_this.shiftLog.timesheetsRouter, "/doAddTimesheetColumn"), addForm, function (rawResponseJSON) {
                var result = rawResponseJSON;
                if (result.success) {
                    closeModalFunction();
                    _this.loadData().then(function () {
                        _this.render();
                    }).catch(function (error) {
                        console.error('Error reloading data:', error);
                    });
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Column Added',
                        message: 'The column has been successfully added.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Column',
                        message: 'Please try again.'
                    });
                }
            });
        };
        cityssm.openHtmlModal('timesheets-addColumn', {
            onshow: function (modalElement) {
                var _a;
                // Set the timesheet ID
                ;
                modalElement.querySelector('#addTimesheetColumn--timesheetId').value = _this.config.timesheetId.toString();
                modalElement.querySelector('#addTimesheetColumn--columnTitle').value = '';
                modalElement.querySelector('#addTimesheetColumn--workOrderNumber').value = '';
                modalElement.querySelector('#addTimesheetColumn--costCenterA').value = '';
                modalElement.querySelector('#addTimesheetColumn--costCenterB').value = '';
                // Attach form submit handler
                (_a = modalElement.querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddColumn);
            },
            onshown: function (_modalElement, closeFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = closeFunction;
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    };
    TimesheetGrid.prototype.deleteColumn = function (column) {
        var _this = this;
        var columnTotal = this.getColumnTotal(column.timesheetColumnId);
        var message = 'Are you sure you want to delete this column?';
        if (columnTotal > 0) {
            message = "<strong>Warning:</strong> This column has <strong>".concat(columnTotal, " recorded hours</strong>. All associated hours will be permanently lost.<br><br>Are you sure you want to delete this column?");
        }
        bulmaJS.confirm({
            title: 'Delete Column',
            message: message,
            messageIsHtml: true,
            contextualColorName: 'danger',
            okButton: {
                text: 'Delete',
                callbackFunction: function () {
                    var timesheetUrlPrefix = "".concat(_this.shiftLog.urlPrefix, "/").concat(_this.shiftLog.timesheetsRouter);
                    cityssm.postJSON("".concat(timesheetUrlPrefix, "/doDeleteTimesheetColumn"), {
                        timesheetColumnId: column.timesheetColumnId
                    }, function (rawResponseJSON) {
                        var result = rawResponseJSON;
                        if (result.success) {
                            _this.loadData().then(function () {
                                _this.render();
                            }).catch(function (error) {
                                console.error('Error reloading data:', error);
                            });
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Column Deleted',
                                message: 'The column has been successfully deleted.'
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
    };
    TimesheetGrid.prototype.moveColumn = function (column, direction) {
        var _this = this;
        // Find the current column and the adjacent one
        var currentIndex = this.columns.findIndex(function (c) { return c.timesheetColumnId === column.timesheetColumnId; });
        if (currentIndex === -1) {
            return;
        }
        var targetIndex;
        if (direction === 'left') {
            targetIndex = currentIndex - 1;
            if (targetIndex < 0) {
                return;
            }
        }
        else {
            targetIndex = currentIndex + 1;
            if (targetIndex >= this.columns.length) {
                return;
            }
        }
        // Swap the columns in the array
        var newColumns = __spreadArray([], this.columns, true);
        var temp = newColumns[currentIndex];
        newColumns[currentIndex] = newColumns[targetIndex];
        newColumns[targetIndex] = temp;
        // Build the new order array
        var timesheetColumnIds = newColumns.map(function (c) { return c.timesheetColumnId; });
        // Send the reorder request
        var timesheetUrlPrefix = "".concat(this.shiftLog.urlPrefix, "/").concat(this.shiftLog.timesheetsRouter);
        cityssm.postJSON("".concat(timesheetUrlPrefix, "/doReorderTimesheetColumns"), {
            timesheetId: this.config.timesheetId,
            timesheetColumnIds: timesheetColumnIds
        }, function (rawResponseJSON) {
            var result = rawResponseJSON;
            if (result.success) {
                _this.loadData().then(function () {
                    _this.render();
                }).catch(function (error) {
                    console.error('Error reloading data:', error);
                });
            }
            else {
                bulmaJS.alert({
                    title: 'Error',
                    message: 'Failed to reorder columns',
                    contextualColorName: 'danger'
                });
            }
        });
    };
    TimesheetGrid.prototype.editRow = function (row) {
        // TODO: Implement row edit modal
        console.log('Edit row', row);
    };
    TimesheetGrid.prototype.deleteRow = function (row) {
        var _this = this;
        bulmaJS.confirm({
            title: 'Delete Row',
            message: 'Are you sure you want to delete this row? All associated hours will be lost.',
            contextualColorName: 'danger',
            okButton: {
                text: 'Delete',
                callbackFunction: function () {
                    var timesheetUrlPrefix = "".concat(_this.shiftLog.urlPrefix, "/").concat(_this.shiftLog.timesheetsRouter);
                    cityssm.postJSON("".concat(timesheetUrlPrefix, "/doDeleteTimesheetRow"), {
                        timesheetRowId: row.timesheetRowId
                    }, function (rawResponseJSON) {
                        var result = rawResponseJSON;
                        if (result.success) {
                            _this.loadData().then(function () {
                                _this.render();
                            }).catch(function (error) {
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
    };
    TimesheetGrid.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadData()];
                    case 1:
                        _a.sent();
                        this.render();
                        return [2 /*return*/];
                }
            });
        });
    };
    TimesheetGrid.prototype.setDisplayOptions = function (options) {
        if (options.hideEmptyRows !== undefined) {
            this.config.hideEmptyRows = options.hideEmptyRows;
        }
        if (options.hideEmptyColumns !== undefined) {
            this.config.hideEmptyColumns = options.hideEmptyColumns;
        }
        this.render();
    };
    return TimesheetGrid;
}());
// Add to exports for use in other scripts
exports.TimesheetGrid = TimesheetGrid;
