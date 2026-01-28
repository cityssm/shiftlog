"use strict";
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var usersContainerElement = document.querySelector('#container--users');
    function deleteUser(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var userName = buttonElement.dataset.userName;
        if (userName === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete User',
            message: "Are you sure you want to delete user \"".concat(userName, "\"? This action cannot be undone."),
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete User',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteUser"), {
                        userName: userName
                    }, function (rawResponseJSON) {
                        var _a;
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            // Update the users list with the new data from the server
                            if (responseJSON.users !== undefined) {
                                renderUsers(responseJSON.users);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'User Deleted',
                                message: 'User has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting User',
                                message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function toggleUserPermission(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var userName = buttonElement.dataset.userName;
        var permission = buttonElement.dataset.permission;
        if (userName === undefined || permission === undefined) {
            return;
        }
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doToggleUserPermission"), {
            permissionField: permission,
            userName: userName
        }, function (rawResponseJSON) {
            var _a;
            var responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderUsers(responseJSON.users);
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Permission',
                    message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                });
            }
        });
    }
    function editUserSettings(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var userName = buttonElement.dataset.userName;
        if (userName === undefined) {
            return;
        }
        // Find the user in the current users list
        var user = exports.users.find(function (u) { return u.userName === userName; });
        if (user === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateUserSettings(submitEvent) {
            submitEvent.preventDefault();
            var settingsForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateUserSettings"), settingsForm, function (rawResponseJSON) {
                var _a;
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    // Update the users list with the new data from the server
                    if (responseJSON.users !== undefined) {
                        exports.users = responseJSON.users;
                        renderUsers(responseJSON.users);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Settings Updated',
                        message: 'User settings have been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Settings',
                        message: (_a = responseJSON.message) !== null && _a !== void 0 ? _a : 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUsers-settings', {
            onshow: function (modalElement) {
                var _a, _b;
                ;
                modalElement.querySelector('#span--userName').textContent = userName;
                modalElement.querySelector('[name="userName"]').value = userName;
                // Pre-populate settings fields
                var settings = (_a = user.userSettings) !== null && _a !== void 0 ? _a : {};
                // Dynamically generate form fields for all user settings
                var containerElement = modalElement.querySelector('#container--userSettings');
                containerElement.innerHTML = '';
                for (var _i = 0, _c = exports.userSettingKeys; _i < _c.length; _i++) {
                    var settingKey = _c[_i];
                    var fieldElement = document.createElement('div');
                    fieldElement.className = 'field';
                    var isApiKey = settingKey === 'apiKey';
                    var settingValue = (_b = settings[settingKey]) !== null && _b !== void 0 ? _b : '';
                    // eslint-disable-next-line no-unsanitized/property
                    fieldElement.innerHTML = /* html */ "\n            <label class=\"label\" for=\"".concat(cityssm.escapeHTML(settingKey), "\">\n              ").concat(cityssm.escapeHTML(settingKey), "\n            </label>\n            <div class=\"field has-addons\">\n              <div class=\"control is-expanded\">\n                <input\n                  class=\"input\"\n                  id=\"").concat(cityssm.escapeHTML(settingKey), "\"\n                  name=\"").concat(cityssm.escapeHTML(settingKey), "\"\n                  type=\"text\"\n                  value=\"").concat(cityssm.escapeHTML(settingValue), "\"\n                  ").concat(isApiKey ? 'readonly' : '', "\n                />\n              </div>\n              ").concat(isApiKey
                        ? "<div class=\"control\">\n                      <button\n                        class=\"button is-warning\"\n                        id=\"button--resetApiKey\"\n                        type=\"button\"\n                        title=\"Reset API Key\"\n                      >\n                        <span class=\"icon\">\n                          <i class=\"fa-solid fa-rotate\"></i>\n                        </span>\n                        <span>Reset</span>\n                      </button>\n                    </div>"
                        : '', "\n            </div>\n          ");
                    containerElement.append(fieldElement);
                }
                // Add event listener for reset API key button
                var resetApiKeyButton = modalElement.querySelector('#button--resetApiKey');
                if (resetApiKeyButton !== null) {
                    resetApiKeyButton.addEventListener('click', function () {
                        bulmaJS.confirm({
                            contextualColorName: 'warning',
                            title: 'Reset API Key',
                            message: "Are you sure you want to reset the API key for user \"".concat(userName, "\"? The old key will no longer work."),
                            okButton: {
                                contextualColorName: 'warning',
                                text: 'Reset API Key',
                                callbackFunction: function () {
                                    resetUserApiKey(userName);
                                }
                            }
                        });
                    });
                }
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateUserSettings);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function resetUserApiKey(userName) {
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doResetUserApiKey"), {
            userName: userName
        }, function (rawResponseJSON) {
            var _a, _b;
            var responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                // Update the users list with the new data from the server
                if (responseJSON.users !== undefined) {
                    exports.users = responseJSON.users;
                    renderUsers(responseJSON.users);
                }
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'API Key Reset',
                    message: 'API key has been successfully reset.'
                });
                var apiKeyInput = document.querySelector('#apiKey');
                if (apiKeyInput !== null) {
                    apiKeyInput.value = (_a = responseJSON.apiKey) !== null && _a !== void 0 ? _a : '';
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Resetting API Key',
                    message: (_b = responseJSON.message) !== null && _b !== void 0 ? _b : 'Please try again.'
                });
            }
        });
    }
    var activePermissionClass = 'is-primary';
    var inactivePermissionClass = 'is-light';
    function buildUserRowElement(user) {
        var rowElement = document.createElement('tr');
        rowElement.dataset.userName = user.userName;
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /* html */ "\n      <th>".concat(cityssm.escapeHTML(user.userName), "</th>\n      <td class=\"has-text-centered has-border-left\">\n        <button\n          class=\"button is-small permission-toggle ").concat(user.isActive ? activePermissionClass : inactivePermissionClass, "\"\n          data-permission=\"isActive\"\n          data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n          title=\"Toggle Active Status\"\n        >\n          ").concat(user.isActive ? 'Yes' : 'No', "\n        </button>\n      </td>\n    ");
        if (shiftLog.shiftsAreEnabled) {
            // eslint-disable-next-line no-unsanitized/method
            rowElement.insertAdjacentHTML('beforeend', 
            /* html */ "\n          <td class=\"has-text-centered has-border-left\">\n            <button\n              class=\"button is-small permission-toggle ".concat(user.shifts_canView ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"shifts_canView\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.shiftsSectionName), " Can View\"\n            >\n              <i class=\"fa-solid fa-").concat(user.shifts_canView ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n          <td class=\"has-text-centered\">\n            <button\n              class=\"button is-small permission-toggle ").concat(user.shifts_canUpdate ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"shifts_canUpdate\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.shiftsSectionName), " Can Update\"\n            >\n              <i class=\"fa-solid fa-").concat(user.shifts_canUpdate ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n          <td class=\"has-text-centered\">\n            <button\n              class=\"button is-small permission-toggle ").concat(user.shifts_canManage ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"shifts_canManage\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.shiftsSectionName), " Can Manage\"\n            >\n              <i class=\"fa-solid fa-").concat(user.shifts_canManage ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n        "));
        }
        if (shiftLog.workOrdersAreEnabled) {
            // eslint-disable-next-line no-unsanitized/method
            rowElement.insertAdjacentHTML('beforeend', 
            /* html */ "\n          <td class=\"has-text-centered has-border-left\">\n            <button\n              class=\"button is-small permission-toggle ".concat(user.workOrders_canView ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"workOrders_canView\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.workOrdersSectionName), " Can View\"\n            >\n              <i class=\"fa-solid fa-").concat(user.workOrders_canView ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n          <td class=\"has-text-centered\">\n            <button\n              class=\"button is-small permission-toggle ").concat(user.workOrders_canUpdate ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"workOrders_canUpdate\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.workOrdersSectionName), " Can Update\"\n            >\n              <i class=\"fa-solid fa-").concat(user.workOrders_canUpdate ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n          <td class=\"has-text-centered\">\n            <button\n              class=\"button is-small permission-toggle ").concat(user.workOrders_canManage ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"workOrders_canManage\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.workOrdersSectionName), " Can Manage\"\n            >\n              <i class=\"fa-solid fa-").concat(user.workOrders_canManage ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n        "));
        }
        if (shiftLog.timesheetsAreEnabled) {
            // eslint-disable-next-line no-unsanitized/method
            rowElement.insertAdjacentHTML('beforeend', 
            /* html */ "\n          <td class=\"has-text-centered has-border-left\">\n            <button\n              class=\"button is-small permission-toggle ".concat(user.timesheets_canView ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"timesheets_canView\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.timesheetsSectionName), " Can View\"\n            >\n              <i class=\"fa-solid fa-").concat(user.timesheets_canView ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n          <td class=\"has-text-centered\">\n            <button\n              class=\"button is-small permission-toggle ").concat(user.timesheets_canUpdate ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"timesheets_canUpdate\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.timesheetsSectionName), " Can Update\"\n            >\n              <i class=\"fa-solid fa-").concat(user.timesheets_canUpdate ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n          <td class=\"has-text-centered\">\n            <button\n              class=\"button is-small permission-toggle ").concat(user.timesheets_canManage ? activePermissionClass : inactivePermissionClass, "\"\n              data-permission=\"timesheets_canManage\"\n              data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n              title=\"Toggle ").concat(cityssm.escapeHTML(shiftLog.timesheetsSectionName), " Can Manage\"\n            >\n              <i class=\"fa-solid fa-").concat(user.timesheets_canManage ? 'check' : 'times', "\"></i>\n            </button>\n          </td>\n        "));
        }
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML += /* html */ "\n      <td class=\"has-text-centered has-border-left\">\n        <button\n          class=\"button is-small permission-toggle ".concat(user.isAdmin ? activePermissionClass : inactivePermissionClass, "\"\n          data-permission=\"isAdmin\"\n          data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n          title=\"Toggle Is Admin\"\n        >\n          ").concat(user.isAdmin ? 'Yes' : 'No', "\n        </button>\n      </td>\n      <td class=\"has-text-centered has-border-left\">\n        <div class=\"buttons is-justify-content-center\">\n          <button\n            class=\"button is-small is-info edit-user-settings\"\n            data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n            title=\"Edit User Settings\"\n          >\n            <span class=\"icon is-small\">\n              <i class=\"fa-solid fa-cog\"></i>\n            </span>\n            <span>Settings</span>\n          </button>\n          <button\n            class=\"button is-small is-danger delete-user\"\n            data-user-name=\"").concat(cityssm.escapeHTML(user.userName), "\"\n            title=\"Delete User\"\n          >\n            Delete\n          </button>\n        </div>\n      </td>\n    ");
        return rowElement;
    }
    function renderUsers(users) {
        var _a;
        if (users.length === 0) {
            usersContainerElement.innerHTML = '<p>No users found.</p>';
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        var sectionColumnHeaderHTML = /* html */ "\n      <th class=\"has-text-centered has-border-left\">View</th>\n      <th class=\"has-text-centered\">Update</th>\n      <th class=\"has-text-centered\">Manage</th>\n    ";
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = /* html */ "\n      <thead>\n        <tr>\n          <th rowspan=\"2\">User Name</th>\n          <th class=\"has-text-centered has-border-left\" rowspan=\"2\">Can Login</th>\n          ".concat(shiftLog.shiftsAreEnabled
            ? /* html */ "\n                <th class=\"has-text-centered has-border-left\" colspan=\"3\">\n                  ".concat(cityssm.escapeHTML(shiftLog.shiftsSectionName), "\n                </th>\n              ")
            : '', "\n          ").concat(shiftLog.workOrdersAreEnabled
            ? /* html */ "\n                <th class=\"has-text-centered has-border-left\" colspan=\"3\">\n                  ".concat(cityssm.escapeHTML(shiftLog.workOrdersSectionName), "\n                </th>\n              ")
            : '', "\n          ").concat(shiftLog.timesheetsAreEnabled
            ? /* html */ "\n                <th class=\"has-text-centered has-border-left\" colspan=\"3\">\n                  ".concat(cityssm.escapeHTML(shiftLog.timesheetsSectionName), "\n                </th>\n              ")
            : '', "\n          <th class=\"has-text-centered has-border-left\" rowspan=\"2\">Is Admin</th>\n          <th class=\"has-text-centered has-border-left\" rowspan=\"2\">\n            <span class=\"is-sr-only\">Actions</span>\n          </th>\n        </tr>\n        <tr>\n          ").concat(shiftLog.shiftsAreEnabled ? sectionColumnHeaderHTML : '', "\n          ").concat(shiftLog.workOrdersAreEnabled ? sectionColumnHeaderHTML : '', "\n          ").concat(shiftLog.timesheetsAreEnabled ? sectionColumnHeaderHTML : '', "\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ");
        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
            var user = users_1[_i];
            var rowElement = buildUserRowElement(user);
            (_a = tableElement.querySelector('tbody')) === null || _a === void 0 ? void 0 : _a.append(rowElement);
        }
        // Add event listeners for permission toggles
        for (var _b = 0, _c = tableElement.querySelectorAll('.permission-toggle'); _b < _c.length; _b++) {
            var button = _c[_b];
            button.addEventListener('click', toggleUserPermission);
        }
        // Add event listeners for edit settings buttons
        for (var _d = 0, _e = tableElement.querySelectorAll('.edit-user-settings'); _d < _e.length; _d++) {
            var button = _e[_d];
            button.addEventListener('click', editUserSettings);
        }
        // Add event listeners for delete buttons
        for (var _f = 0, _g = tableElement.querySelectorAll('.delete-user'); _f < _g.length; _f++) {
            var button = _g[_f];
            button.addEventListener('click', deleteUser);
        }
        usersContainerElement.replaceChildren(tableElement);
    }
    (_a = document.querySelector('#button--addUser')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        var closeModalFunction;
        function doAddUser(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddUser"), addForm, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    exports.users = responseJSON.users;
                    renderUsers(responseJSON.users);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding User',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUsers-add', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('#span--domain').textContent = "".concat(exports.domain, "\\");
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement.querySelector('#userName').focus();
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddUser);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderUsers(exports.users);
})();
