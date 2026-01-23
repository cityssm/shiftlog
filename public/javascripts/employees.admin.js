"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var employeesContainerElement = document.querySelector('#container--employees');
    // Pagination settings
    var ITEMS_PER_PAGE = 10;
    var FILTER_DEBOUNCE_MS = 300;
    var currentPage = 1;
    var currentFilteredEmployees = exports.employees;
    function pageSelect(pageNumber) {
        currentPage = pageNumber;
        renderEmployeesWithPagination(currentFilteredEmployees);
    }
    function deleteEmployee(clickEvent) {
        var _a, _b;
        var buttonElement = clickEvent.currentTarget;
        var employeeNumber = buttonElement.dataset.employeeNumber;
        if (employeeNumber === undefined) {
            return;
        }
        var employee = exports.employees.find(function (possibleEmployee) { return possibleEmployee.employeeNumber === employeeNumber; });
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Employee',
            message: "Are you sure you want to delete employee \"".concat((_a = employee === null || employee === void 0 ? void 0 : employee.firstName) !== null && _a !== void 0 ? _a : '', " ").concat((_b = employee === null || employee === void 0 ? void 0 : employee.lastName) !== null && _b !== void 0 ? _b : '', "\" (").concat(employeeNumber, ")? This action cannot be undone."),
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Employee',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteEmployee"), {
                        employeeNumber: employeeNumber
                    }, function (responseJSON) {
                        var _a;
                        if (responseJSON.success) {
                            // Update the employees list with the new data from the server
                            if (responseJSON.employees !== undefined) {
                                exports.employees = responseJSON.employees;
                                applyCurrentFilter();
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Employee Deleted',
                                message: 'Employee has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Employee',
                                message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editEmployee(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var employeeNumber = buttonElement.dataset.employeeNumber;
        if (employeeNumber === undefined) {
            return;
        }
        // Find the employee in the current employees list
        var employee = exports.employees.find(function (possibleEmployee) { return possibleEmployee.employeeNumber === employeeNumber; });
        if (employee === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateEmployee(submitEvent) {
            submitEvent.preventDefault();
            var editForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateEmployee"), editForm, function (responseJSON) {
                var _a;
                if (responseJSON.success) {
                    closeModalFunction();
                    // Update the employees list with the new data from the server
                    if (responseJSON.employees !== undefined) {
                        exports.employees = responseJSON.employees;
                        applyCurrentFilter();
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Employee Updated',
                        message: 'Employee has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Employee',
                        message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployees-edit', {
            onshow: function (modalElement) {
                var _a, _b, _c, _d;
                // Set employeeNumber field
                ;
                modalElement.querySelector('#editEmployee--employeeNumber').value = employeeNumber;
                modalElement.querySelector('#editEmployee--firstName').value = employee.firstName;
                modalElement.querySelector('#editEmployee--lastName').value = employee.lastName;
                modalElement.querySelector('#editEmployee--userName').value = (_a = employee.userName) !== null && _a !== void 0 ? _a : '';
                modalElement.querySelector('#editEmployee--isSupervisor').checked = employee.isSupervisor;
                modalElement.querySelector('#editEmployee--recordSync_isSynced').checked = employee.recordSync_isSynced;
                modalElement.querySelector('#editEmployee--phoneNumber').value = (_b = employee.phoneNumber) !== null && _b !== void 0 ? _b : '';
                modalElement.querySelector('#editEmployee--phoneNumberAlternate').value = (_c = employee.phoneNumberAlternate) !== null && _c !== void 0 ? _c : '';
                modalElement.querySelector('#editEmployee--emailAddress').value = (_d = employee.emailAddress) !== null && _d !== void 0 ? _d : '';
                // Populate user groups dropdown
                var userGroupSelect = modalElement.querySelector('#editEmployee--userGroupId');
                for (var _i = 0, _e = exports.userGroups; _i < _e.length; _i++) {
                    var userGroup = _e[_i];
                    var optionElement = document.createElement('option');
                    optionElement.value = userGroup.userGroupId.toString();
                    optionElement.textContent = userGroup.userGroupName;
                    if (employee.userGroupId !== null &&
                        employee.userGroupId !== undefined &&
                        employee.userGroupId === userGroup.userGroupId) {
                        optionElement.selected = true;
                    }
                    userGroupSelect.append(optionElement);
                }
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateEmployee);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function buildEmployeeRowElement(employee) {
        var _a, _b, _c;
        var rowElement = document.createElement('tr');
        rowElement.dataset.employeeNumber = employee.employeeNumber;
        var userGroup = exports.userGroups.find(function (ug) { return ug.userGroupId === employee.userGroupId; });
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /* html */ "\n      <td>\n        ".concat(employee.recordSync_isSynced
            ? /* html */ "\n              <span class=\"is-size-7 has-text-grey\" title=\"Synchronized\">\n                <i class=\"fa-solid fa-arrows-rotate\"></i>\n              </span>\n            "
            : '', "\n      </td>\n      <td>\n        ").concat(cityssm.escapeHTML(employee.employeeNumber), "\n      </td>\n      <td>").concat(cityssm.escapeHTML(employee.lastName), ", ").concat(cityssm.escapeHTML(employee.firstName), "</td>\n      <td class=\"has-text-centered\">\n        ").concat(employee.isSupervisor ? '<i class="fa-solid fa-check"></i>' : '-', "\n      </td>\n      <td>").concat(cityssm.escapeHTML((_a = employee.userName) !== null && _a !== void 0 ? _a : ''), "</td>\n      <td>").concat(cityssm.escapeHTML((_b = employee.phoneNumber) !== null && _b !== void 0 ? _b : ''), "</td>\n      <td>").concat(cityssm.escapeHTML((_c = employee.emailAddress) !== null && _c !== void 0 ? _c : ''), "</td>\n      <td>").concat(userGroup === undefined ? '' : cityssm.escapeHTML(userGroup.userGroupName), "</td>\n      <td class=\"has-text-right\">\n        <div class=\"buttons is-right\">\n          <button\n            class=\"button is-small is-info edit-employee\"\n            data-employee-number=\"").concat(cityssm.escapeHTML(employee.employeeNumber), "\"\n            title=\"Edit Employee\"\n          >\n            <span class=\"icon is-small\">\n              <i class=\"fa-solid fa-pencil\"></i>\n            </span>\n            <span>Edit</span>\n          </button>\n          <button\n            class=\"button is-small is-danger delete-employee\"\n            data-employee-number=\"").concat(cityssm.escapeHTML(employee.employeeNumber), "\"\n            title=\"Delete Employee\"\n          >\n            <span class=\"icon is-small\">\n              <i class=\"fa-solid fa-trash\"></i>\n            </span>\n            <span>Delete</span>\n          </button>\n        </div>\n      </td>\n    ");
        return rowElement;
    }
    function renderEmployees(employees) {
        var _a;
        if (employees.length === 0) {
            employeesContainerElement.innerHTML = /* html */ "\n        <div class=\"message is-info\">\n          <div class=\"message-body\">\n            No employees available.\n          </div>\n        </div>\n      ";
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className =
            'table is-fullwidth is-striped is-hoverable has-sticky-header';
        tableElement.innerHTML = /* html */ "\n      <thead>\n        <tr>\n          <th>\n            <span class=\"is-sr-only\">Sync Status</span>\n          </th>\n          <th>Employee Number</th>\n          <th>Name</th>\n          <th class=\"has-text-centered\">Supervisor</th>\n          <th>User Name</th>\n          <th>Phone</th>\n          <th>Email</th>\n          <th>User Group</th>\n          <th>\n            <span class=\"is-sr-only\">Actions</span>\n          </th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ";
        for (var _i = 0, employees_1 = employees; _i < employees_1.length; _i++) {
            var employee = employees_1[_i];
            var rowElement = buildEmployeeRowElement(employee);
            (_a = tableElement.querySelector('tbody')) === null || _a === void 0 ? void 0 : _a.append(rowElement);
        }
        // Add event listeners for edit buttons
        for (var _b = 0, _c = tableElement.querySelectorAll('.edit-employee'); _b < _c.length; _b++) {
            var button = _c[_b];
            button.addEventListener('click', editEmployee);
        }
        // Add event listeners for delete buttons
        for (var _d = 0, _e = tableElement.querySelectorAll('.delete-employee'); _d < _e.length; _d++) {
            var button = _e[_d];
            button.addEventListener('click', deleteEmployee);
        }
        employeesContainerElement.replaceChildren(tableElement);
    }
    /**
     * Render employees with pagination
     * @param employees - List of employees to render
     */
    function renderEmployeesWithPagination(employees) {
        // Calculate pagination
        var startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        var endIndex = startIndex + ITEMS_PER_PAGE;
        var paginatedEmployees = employees.slice(startIndex, endIndex);
        // Render table
        renderEmployees(paginatedEmployees);
        // Add pagination controls if needed
        if (employees.length > ITEMS_PER_PAGE) {
            var paginationControls = shiftLog.buildPaginationControls({
                totalCount: employees.length,
                currentPageOrOffset: currentPage,
                itemsPerPageOrLimit: ITEMS_PER_PAGE,
                clickHandler: pageSelect
            });
            employeesContainerElement.append(paginationControls);
        }
    }
    (_a = document
        .querySelector('#button--addEmployee')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        var closeModalFunction;
        function doAddEmployee(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddEmployee"), addForm, function (responseJSON) {
                var _a;
                if (responseJSON.success) {
                    closeModalFunction();
                    addForm.reset();
                    // Update the employees list with the new data from the server
                    if (responseJSON.employees !== undefined) {
                        exports.employees = responseJSON.employees;
                        applyCurrentFilter();
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Employee Added',
                        message: 'Employee has been successfully added. You can now edit it to add more details.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Employee',
                        message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployees-add', {
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddEmployee);
                modalElement.querySelector('#addEmployee--employeeNumber').focus();
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderEmployeesWithPagination(exports.employees);
    /*
     * Filter employees with debouncing
     */
    var filterInput = document.querySelector('#filter--employees');
    var filterTimeout;
    /**
     * Apply the current filter to the employees list
     */
    function applyCurrentFilter() {
        var filteredEmployees = exports.employees;
        if (filterInput !== null) {
            var filterText_1 = filterInput.value.toLowerCase();
            if (filterText_1 !== '') {
                filteredEmployees = exports.employees.filter(function (possibleEmployee) {
                    var _a, _b, _c;
                    var searchText = "".concat(possibleEmployee.employeeNumber, " ").concat(possibleEmployee.firstName, " ").concat(possibleEmployee.lastName, " ").concat((_a = possibleEmployee.userName) !== null && _a !== void 0 ? _a : '', " ").concat((_b = possibleEmployee.phoneNumber) !== null && _b !== void 0 ? _b : '', " ").concat((_c = possibleEmployee.emailAddress) !== null && _c !== void 0 ? _c : '').toLowerCase();
                    return searchText.includes(filterText_1);
                });
            }
        }
        currentFilteredEmployees = filteredEmployees;
        currentPage = 1;
        renderEmployeesWithPagination(filteredEmployees);
    }
    if (filterInput !== null) {
        filterInput.addEventListener('input', function () {
            // Clear existing timeout
            if (filterTimeout !== undefined) {
                clearTimeout(filterTimeout);
            }
            // Set new timeout (debounce)
            filterTimeout = setTimeout(function () {
                applyCurrentFilter();
            }, FILTER_DEBOUNCE_MS);
        });
    }
})();
//# sourceMappingURL=employees.admin.js.map