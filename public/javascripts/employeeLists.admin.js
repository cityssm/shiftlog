"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var employeeListsContainerElement = document.querySelector('#container--employeeLists');
    // Track Sortable instances to prevent duplicates
    var sortableInstances = new Map();
    function deleteEmployeeList(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var employeeListId = Number.parseInt((_a = buttonElement.dataset.employeeListId) !== null && _a !== void 0 ? _a : '', 10);
        var employeeList = exports.employeeLists.find(function (list) { return list.employeeListId === employeeListId; });
        if (employeeList === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Employee List',
            message: "Are you sure you want to delete the employee list \"".concat(cityssm.escapeHTML(employeeList.employeeListName), "\"? This action cannot be undone."),
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete Employee List',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteEmployeeList"), {
                        employeeListId: employeeListId
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.employeeLists !== undefined) {
                                exports.employeeLists = responseJSON.employeeLists;
                                renderEmployeeLists();
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'Employee List Deleted',
                                message: 'Employee list has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting Employee List',
                                message: 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editEmployeeList(clickEvent) {
        var _a;
        var buttonElement = clickEvent.currentTarget;
        var employeeListId = Number.parseInt((_a = buttonElement.dataset.employeeListId) !== null && _a !== void 0 ? _a : '', 10);
        var employeeList = exports.employeeLists.find(function (list) { return list.employeeListId === employeeListId; });
        if (employeeList === undefined) {
            return;
        }
        var formElement;
        var closeModalFunction;
        function doEdit(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateEmployeeList"), formElement, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.employeeLists !== undefined) {
                        exports.employeeLists = responseJSON.employeeLists;
                        renderEmployeeLists();
                    }
                    closeModalFunction();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Employee List Updated',
                        message: 'Employee list has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Employee List',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployeeLists-edit', {
            onshow: function (modalElement) {
                var _a;
                modalElement.querySelector('.modal-card-title').textContent =
                    'Edit Employee List';
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#employeeListEdit--employeeListId').value = employeeListId.toString();
                formElement.querySelector('#employeeListEdit--employeeListName').value = employeeList.employeeListName;
                formElement.querySelector('#employeeListEdit--userGroupId').value = ((_a = employeeList.userGroupId) !== null && _a !== void 0 ? _a : '').toString();
                formElement.addEventListener('submit', doEdit);
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
            },
            onhidden: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function addEmployeeList() {
        var formElement;
        var closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddEmployeeList"), formElement, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.employeeLists !== undefined) {
                        exports.employeeLists = responseJSON.employeeLists;
                        renderEmployeeLists();
                    }
                    closeModalFunction();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Employee List Added',
                        message: 'Employee list has been successfully added.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Employee List',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployeeLists-add', {
            onshow: function (modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.addEventListener('submit', doAdd);
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
            },
            onhidden: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function loadEmployeeListDetails(employeeListId, panelElement) {
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doGetEmployeeList"), {
            employeeListId: employeeListId
        }, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.employeeList !== undefined) {
                renderEmployeeListMembers(responseJSON.employeeList, panelElement);
            }
        });
    }
    function deleteEmployeeListMember(employeeListId, employeeNumber, panelElement) {
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteEmployeeListMember"), {
            employeeListId: employeeListId,
            employeeNumber: employeeNumber
        }, function (rawResponseJSON) {
            var responseJSON = rawResponseJSON;
            if (responseJSON.success && responseJSON.employeeList !== undefined) {
                renderEmployeeListMembers(responseJSON.employeeList, panelElement);
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Member Removed',
                    message: 'Employee has been removed from the list.'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Removing Member',
                    message: 'Please try again.'
                });
            }
        });
    }
    function addEmployeeListMember(employeeListId, panelElement) {
        var formElement;
        var closeModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            var formData = new FormData(formElement);
            var employeeNumber = formData.get('employeeNumber').trim();
            if (employeeNumber === '') {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Missing Employee',
                    message: 'Please select an employee.'
                });
                return;
            }
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddEmployeeListMember"), formElement, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success &&
                    responseJSON.employeeList !== undefined) {
                    renderEmployeeListMembers(responseJSON.employeeList, panelElement);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Member Added',
                        message: 'Employee has been added to the list.'
                    });
                    closeModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Member',
                        message: 'Please try again. The employee may already be in the list.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminEmployeeLists-addMember', {
            onshow: function (modalElement) {
                formElement = modalElement.querySelector('form');
                formElement.querySelector('#employeeListMember--employeeListId').value = employeeListId.toString();
                // Populate employee select
                var selectElement = formElement.querySelector('#employeeListMember--employeeNumber');
                for (var _i = 0, _a = exports.employees; _i < _a.length; _i++) {
                    var employee = _a[_i];
                    var optionElement = document.createElement('option');
                    optionElement.value = employee.employeeNumber;
                    optionElement.textContent = "".concat(employee.firstName, " ").concat(employee.lastName, " (").concat(employee.employeeNumber, ")");
                    selectElement.append(optionElement);
                }
                // Initialize flatpickr for seniority date
                var seniorityDateInput = formElement.querySelector('#employeeListMember--seniorityDate');
                window.flatpickr(seniorityDateInput, {
                    dateFormat: 'Y-m-d',
                    allowInput: true
                });
                formElement.addEventListener('submit', doAdd);
            },
            onshown: function (_modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
            },
            onhidden: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function initializeSortable(employeeListId, seniorityDate, panelElement) {
        var containerId = seniorityDate
            ? "members--".concat(employeeListId, "--").concat(seniorityDate)
            : "members--".concat(employeeListId, "--nodate");
        var tbodyElement = document.querySelector("#".concat(containerId));
        if (tbodyElement === null) {
            return;
        }
        // Check if the tbody has any sortable items
        var hasItems = tbodyElement.querySelectorAll('tr[data-employee-number]').length > 0;
        if (!hasItems) {
            // Destroy existing instance if no items
            var existingInstance_1 = sortableInstances.get(containerId);
            if (existingInstance_1 !== undefined) {
                existingInstance_1.destroy();
                sortableInstances.delete(containerId);
            }
            return;
        }
        // Destroy existing Sortable instance before creating a new one
        var existingInstance = sortableInstances.get(containerId);
        if (existingInstance !== undefined) {
            existingInstance.destroy();
        }
        // Create new Sortable instance
        var sortableInstance = Sortable.create(tbodyElement, {
            handle: '.handle',
            animation: 150,
            onEnd: function () {
                // Get the new order
                var rows = tbodyElement.querySelectorAll('tr[data-employee-number]');
                var employeeNumbers = [];
                for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                    var row = rows_1[_i];
                    var employeeNumber = row.dataset.employeeNumber;
                    if (employeeNumber !== undefined) {
                        employeeNumbers.push(employeeNumber);
                    }
                }
                // Send to server
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doReorderEmployeeListMembers"), {
                    employeeListId: employeeListId,
                    employeeNumbers: employeeNumbers,
                    seniorityDate: seniorityDate !== null && seniorityDate !== void 0 ? seniorityDate : undefined
                }, function (rawResponseJSON) {
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.success &&
                        responseJSON.employeeList !== undefined) {
                        renderEmployeeListMembers(responseJSON.employeeList, panelElement);
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Reordering Members',
                            message: 'Please refresh the page and try again.'
                        });
                    }
                });
            }
        });
        // Store the instance for future reference
        sortableInstances.set(containerId, sortableInstance);
    }
    function renderEmployeeListMembers(employeeList, panelElement) {
        var _a, _b, _c, _d;
        var membersContainerElement = panelElement.querySelector('.panel-block-members');
        if (employeeList.members.length === 0) {
            membersContainerElement.innerHTML = "<div class=\"panel-block\">\n        <p class=\"has-text-grey\">\n          No employees in this list. Click \"Add Member\" to add an employee.\n        </p>\n      </div>";
            return;
        }
        // Group members by seniority date
        var membersByDate = new Map();
        for (var _i = 0, _e = employeeList.members; _i < _e.length; _i++) {
            var member = _e[_i];
            var dateKey = (_b = (_a = member.seniorityDate) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : 'no-date';
            if (!membersByDate.has(dateKey)) {
                membersByDate.set(dateKey, []);
            }
            membersByDate.get(dateKey).push(member);
        }
        var membersHtml = '';
        for (var _f = 0, membersByDate_1 = membersByDate; _f < membersByDate_1.length; _f++) {
            var _g = membersByDate_1[_f], dateKey = _g[0], members = _g[1];
            var containerId = dateKey === 'no-date'
                ? "members--".concat(employeeList.employeeListId, "--nodate")
                : "members--".concat(employeeList.employeeListId, "--").concat(dateKey);
            var dateDisplay = dateKey === 'no-date'
                ? 'No Seniority Date'
                : cityssm.dateToString(new Date(dateKey));
            membersHtml += "<div class=\"panel-block is-block p-0\">\n        <div class=\"px-4 py-2 has-background-light\">\n          <strong>".concat(dateDisplay, "</strong>\n        </div>\n        <div class=\"table-container\" style=\"width: 100%;\">\n          <table class=\"table is-striped is-hoverable is-fullwidth mb-0\">\n            <thead>\n              <tr>\n                <th style=\"width: 60px;\">Order</th>\n                <th>Employee Name</th>\n                <th>Employee Number</th>\n                <th>\n                  <span class=\"is-sr-only\">Actions</span>\n                </th>\n              </tr>\n            </thead>\n            <tbody class=\"is-sortable\" id=\"").concat(containerId, "\">");
            for (var _h = 0, members_1 = members; _h < members_1.length; _h++) {
                var member = members_1[_h];
                // eslint-disable-next-line no-unsanitized/method
                membersHtml += "<tr data-employee-number=\"".concat(cityssm.escapeHTML(member.employeeNumber), "\">\n          <td class=\"has-text-centered\">\n            <span class=\"icon is-small has-text-grey handle\" style=\"cursor: move;\">\n              <i class=\"fa-solid fa-grip-vertical\"></i>\n            </span>\n          </td>\n          <td>\n            ").concat(cityssm.escapeHTML((_c = member.firstName) !== null && _c !== void 0 ? _c : ''), " ").concat(cityssm.escapeHTML((_d = member.lastName) !== null && _d !== void 0 ? _d : ''), "\n          </td>\n          <td>\n            ").concat(cityssm.escapeHTML(member.employeeNumber), "\n          </td>\n          <td class=\"has-text-right\">\n            <button\n              class=\"button is-danger is-small button--deleteMember\"\n              data-employee-number=\"").concat(cityssm.escapeHTML(member.employeeNumber), "\"\n              type=\"button\"\n              aria-label=\"Delete\"\n            >\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-trash\"></i>\n              </span>\n            </button>\n          </td>\n        </tr>");
            }
            membersHtml += "</tbody>\n          </table>\n        </div>\n      </div>";
        }
        membersContainerElement.innerHTML = membersHtml;
        // Add event listeners for delete buttons
        var deleteButtons = membersContainerElement.querySelectorAll('.button--deleteMember');
        for (var _j = 0, deleteButtons_1 = deleteButtons; _j < deleteButtons_1.length; _j++) {
            var button = deleteButtons_1[_j];
            button.addEventListener('click', function (clickEvent) {
                var _a, _b, _c;
                var buttonElement = clickEvent.currentTarget;
                var employeeNumber = (_a = buttonElement.dataset.employeeNumber) !== null && _a !== void 0 ? _a : '';
                var member = employeeList.members.find(function (m) { return m.employeeNumber === employeeNumber; });
                if (member === undefined) {
                    return;
                }
                bulmaJS.confirm({
                    contextualColorName: 'warning',
                    title: 'Remove Employee',
                    message: "Are you sure you want to remove ".concat(cityssm.escapeHTML((_b = member.firstName) !== null && _b !== void 0 ? _b : ''), " ").concat(cityssm.escapeHTML((_c = member.lastName) !== null && _c !== void 0 ? _c : ''), " from this list?"),
                    okButton: {
                        contextualColorName: 'warning',
                        text: 'Remove Employee',
                        callbackFunction: function () {
                            deleteEmployeeListMember(employeeList.employeeListId, employeeNumber, panelElement);
                        }
                    }
                });
            });
        }
        // Initialize sortable for each date group
        for (var _k = 0, membersByDate_2 = membersByDate; _k < membersByDate_2.length; _k++) {
            var _l = membersByDate_2[_k], dateKey = _l[0], _members = _l[1];
            initializeSortable(employeeList.employeeListId, dateKey === 'no-date' ? null : dateKey, panelElement);
        }
    }
    function renderEmployeeLists() {
        var _a;
        if (exports.employeeLists.length === 0) {
            employeeListsContainerElement.innerHTML = "<div class=\"message is-info\">\n        <div class=\"message-body\">\n          <p class=\"has-text-centered\">\n            No employee lists have been created yet.\n          </p>\n          <p class=\"has-text-centered mt-3\">\n            Click \"Add Employee List\" to create one.\n          </p>\n        </div>\n      </div>";
            return;
        }
        employeeListsContainerElement.innerHTML = '';
        var _loop_1 = function (employeeList) {
            var userGroup = employeeList.userGroupId
                ? exports.userGroups.find(function (ug) { return ug.userGroupId === employeeList.userGroupId; })
                : undefined;
            var panelElement = document.createElement('details');
            panelElement.className = 'panel mb-5 collapsable-panel';
            panelElement.dataset.employeeListId =
                employeeList.employeeListId.toString();
            // eslint-disable-next-line no-unsanitized/property
            panelElement.innerHTML = "<summary class=\"panel-heading is-clickable\">\n        <span class=\"icon-text\">\n          <span class=\"icon\">\n            <i class=\"fa-solid fa-chevron-right details-chevron\"></i>\n          </span>\n          <span class=\"has-text-weight-semibold mr-2\">\n            ".concat(cityssm.escapeHTML(employeeList.employeeListName), "\n          </span>\n          ").concat(userGroup !== undefined
                ? "<span class=\"tag is-info\">".concat(cityssm.escapeHTML(userGroup.userGroupName), "</span>")
                : '', "\n          <span class=\"tag is-rounded ml-2\">").concat((_a = employeeList.memberCount) !== null && _a !== void 0 ? _a : 0, "</span>\n        </span>\n      </summary>\n      <div class=\"panel-block is-justify-content-space-between is-align-items-center\">\n        <div class=\"buttons are-small mb-0\">\n          <button\n            class=\"button is-primary button--addMember\"\n            type=\"button\"\n          >\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-plus\"></i>\n            </span>\n            <span>Add Member</span>\n          </button>\n        </div>\n        <div class=\"buttons are-small mb-0\">\n          <button\n            class=\"button is-info button--editEmployeeList\"\n            data-employee-list-id=\"").concat(employeeList.employeeListId, "\"\n            type=\"button\"\n          >\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-pencil\"></i>\n            </span>\n            <span>Edit List</span>\n          </button>\n          <button\n            class=\"button is-danger button--deleteEmployeeList\"\n            data-employee-list-id=\"").concat(employeeList.employeeListId, "\"\n            type=\"button\"\n          >\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-trash\"></i>\n            </span>\n            <span>Delete List</span>\n          </button>\n        </div>\n      </div>\n      <div class=\"panel-block-members\"></div>");
            employeeListsContainerElement.append(panelElement);
            // Add event listeners
            panelElement
                .querySelector('.button--editEmployeeList')
                .addEventListener('click', editEmployeeList);
            panelElement
                .querySelector('.button--deleteEmployeeList')
                .addEventListener('click', deleteEmployeeList);
            panelElement
                .querySelector('.button--addMember')
                .addEventListener('click', function () {
                addEmployeeListMember(employeeList.employeeListId, panelElement);
            });
            // Load details when panel is opened
            panelElement.addEventListener('toggle', function () {
                if (panelElement.open) {
                    loadEmployeeListDetails(employeeList.employeeListId, panelElement);
                }
            });
        };
        for (var _i = 0, _b = exports.employeeLists; _i < _b.length; _i++) {
            var employeeList = _b[_i];
            _loop_1(employeeList);
        }
    }
    // Initialize
    renderEmployeeLists();
    document
        .querySelector('#button--addEmployeeList')
        .addEventListener('click', addEmployeeList);
})();
