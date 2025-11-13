"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var _a;
    var shiftLog = exports.shiftLog;
    var userGroupsContainerElement = document.querySelector('#container--userGroups');
    function deleteUserGroup(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var userGroupId = buttonElement.dataset.userGroupId;
        if (userGroupId === undefined) {
            return;
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete User Group',
            message: 'Are you sure you want to delete this user group?',
            okButton: {
                contextualColorName: 'warning',
                text: 'Delete User Group',
                callbackFunction: function () {
                    cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteUserGroup"), {
                        userGroupId: userGroupId
                    }, function (rawResponseJSON) {
                        var responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            if (responseJSON.userGroups !== undefined) {
                                exports.userGroups = responseJSON.userGroups;
                                renderUserGroups(responseJSON.userGroups);
                            }
                            bulmaJS.alert({
                                contextualColorName: 'success',
                                title: 'User Group Deleted',
                                message: 'User group has been successfully deleted.'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Deleting User Group',
                                message: 'Please try again.'
                            });
                        }
                    });
                }
            }
        });
    }
    function editUserGroup(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var userGroupId = buttonElement.dataset.userGroupId;
        if (userGroupId === undefined) {
            return;
        }
        var userGroup = exports.userGroups.find(function (ug) { return ug.userGroupId.toString() === userGroupId; });
        if (userGroup === undefined) {
            return;
        }
        var closeModalFunction;
        function doUpdateUserGroup(submitEvent) {
            submitEvent.preventDefault();
            var updateForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doUpdateUserGroup"), updateForm, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    if (responseJSON.userGroups !== undefined) {
                        exports.userGroups = responseJSON.userGroups;
                        renderUserGroups(responseJSON.userGroups);
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'User Group Updated',
                        message: 'User group has been successfully updated.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating User Group',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUserGroups-edit', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('[name="userGroupId"]').value = userGroupId;
                modalElement.querySelector('[name="userGroupName"]').value = userGroup.userGroupName;
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateUserGroup);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function manageMembers(clickEvent) {
        var buttonElement = clickEvent.currentTarget;
        var userGroupId = buttonElement.dataset.userGroupId;
        if (userGroupId === undefined) {
            return;
        }
        var userGroup = exports.userGroups.find(function (ug) { return ug.userGroupId.toString() === userGroupId; });
        if (userGroup === undefined) {
            return;
        }
        var closeModalFunction;
        var currentMembers = [];
        function refreshMembers() {
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddUserGroupMember"), {
                userGroupId: userGroupId,
                userName: '' // Empty to just get current state
            }, function (rawResponseJSON) {
                var _a;
                var responseJSON = rawResponseJSON;
                if (responseJSON.userGroup !== undefined) {
                    currentMembers = (_a = responseJSON.userGroup.members) !== null && _a !== void 0 ? _a : [];
                    renderMembersList();
                }
            });
        }
        function renderMembersList() {
            var modalElement = document.querySelector('.modal.is-active');
            var membersContainer = modalElement.querySelector('#container--members');
            if (currentMembers.length === 0) {
                membersContainer.innerHTML = '<p class="has-text-grey">No members in this group.</p>';
                return;
            }
            var listHtml = currentMembers
                .map(function (userName) { /*html*/ return "\n        <div class=\"field is-grouped\">\n          <div class=\"control is-expanded\">\n            <input class=\"input\" type=\"text\" value=\"".concat(cityssm.escapeHTML(userName), "\" readonly />\n          </div>\n          <div class=\"control\">\n            <button class=\"button is-danger remove-member\" data-user-name=\"").concat(cityssm.escapeHTML(userName), "\" type=\"button\">\n              <span class=\"icon\">\n                <i class=\"fa-solid fa-times\"></i>\n              </span>\n              <span>Remove</span>\n            </button>\n          </div>\n        </div>\n      "); })
                .join('');
            membersContainer.innerHTML = listHtml;
            // Add event listeners for remove buttons
            for (var _i = 0, _a = membersContainer.querySelectorAll('.remove-member'); _i < _a.length; _i++) {
                var button = _a[_i];
                button.addEventListener('click', removeMember);
            }
        }
        function addMember(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            var userName = addForm.querySelector('[name="userName"]').value;
            if (userName === '') {
                return;
            }
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddUserGroupMember"), {
                userGroupId: userGroupId,
                userName: userName
            }, function (rawResponseJSON) {
                var _a;
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.userGroup !== undefined) {
                        currentMembers = (_a = responseJSON.userGroup.members) !== null && _a !== void 0 ? _a : [];
                        renderMembersList();
                    }
                    // Reset the form
                    ;
                    addForm.querySelector('[name="userName"]').value = '';
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Member Added',
                        message: 'User has been added to the group.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Member',
                        message: 'Please try again.'
                    });
                }
            });
        }
        function removeMember(clickEvent) {
            var removeButton = clickEvent.currentTarget;
            var userName = removeButton.dataset.userName;
            if (userName === undefined) {
                return;
            }
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doDeleteUserGroupMember"), {
                userGroupId: userGroupId,
                userName: userName
            }, function (rawResponseJSON) {
                var _a;
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    if (responseJSON.userGroup !== undefined) {
                        currentMembers = (_a = responseJSON.userGroup.members) !== null && _a !== void 0 ? _a : [];
                        renderMembersList();
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'Member Removed',
                        message: 'User has been removed from the group.'
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
        cityssm.openHtmlModal('adminUserGroups-members', {
            onshow: function (modalElement) {
                ;
                modalElement.querySelector('#span--groupName').textContent = userGroup.userGroupName;
                // Populate user dropdown
                var userSelect = modalElement.querySelector('[name="userName"]');
                userSelect.innerHTML =
                    '<option value="">Select a user...</option>' +
                        exports.users
                            .map(function (user) {
                            /*html*/ return "<option value=\"".concat(cityssm.escapeHTML(user.userName), "\">").concat(cityssm.escapeHTML(user.userName), "</option>");
                        })
                            .join('');
                // Get current members
                cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddUserGroupMember"), {
                    userGroupId: userGroupId,
                    userName: '' // Empty to just get current state
                }, function (rawResponseJSON) {
                    var _a;
                    var responseJSON = rawResponseJSON;
                    if (responseJSON.userGroup !== undefined) {
                        currentMembers = (_a = responseJSON.userGroup.members) !== null && _a !== void 0 ? _a : [];
                        renderMembersList();
                    }
                });
            },
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('#form--addMember')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', addMember);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function buildUserGroupRowElement(userGroup) {
        var _a;
        var rowElement = document.createElement('tr');
        // eslint-disable-next-line no-unsanitized/property
        rowElement.innerHTML = /*html*/ "\n      <td>".concat(cityssm.escapeHTML(userGroup.userGroupName), "</td>\n      <td class=\"has-text-centered\">").concat((_a = userGroup.memberCount) !== null && _a !== void 0 ? _a : 0, "</td>\n      <td class=\"has-text-centered\">\n        <div class=\"buttons is-justify-content-center\">\n          <button\n            class=\"button is-small is-info manage-members\"\n            data-user-group-id=\"").concat(userGroup.userGroupId, "\"\n            title=\"Manage Members\"\n          >\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-users\"></i>\n            </span>\n            <span>Members</span>\n          </button>\n          <button\n            class=\"button is-small is-primary edit-user-group\"\n            data-user-group-id=\"").concat(userGroup.userGroupId, "\"\n            title=\"Edit User Group\"\n          >\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-edit\"></i>\n            </span>\n            <span>Edit</span>\n          </button>\n          <button\n            class=\"button is-small is-danger delete-user-group\"\n            data-user-group-id=\"").concat(userGroup.userGroupId, "\"\n            title=\"Delete User Group\"\n          >\n            <span class=\"icon\">\n              <i class=\"fa-solid fa-trash\"></i>\n            </span>\n            <span>Delete</span>\n          </button>\n        </div>\n      </td>\n    ");
        return rowElement;
    }
    function renderUserGroups(userGroups) {
        var _a;
        if (userGroups.length === 0) {
            userGroupsContainerElement.innerHTML =
                '<p class="has-text-grey">No user groups found.</p>';
            return;
        }
        var tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = /*html*/ "\n      <thead>\n        <tr>\n          <th>Group Name</th>\n          <th class=\"has-text-centered\">Members</th>\n          <th class=\"has-text-centered\">Actions</th>\n        </tr>\n      </thead>\n      <tbody></tbody>\n    ";
        for (var _i = 0, userGroups_1 = userGroups; _i < userGroups_1.length; _i++) {
            var userGroup = userGroups_1[_i];
            var rowElement = buildUserGroupRowElement(userGroup);
            (_a = tableElement.querySelector('tbody')) === null || _a === void 0 ? void 0 : _a.append(rowElement);
        }
        // Add event listeners
        for (var _b = 0, _c = tableElement.querySelectorAll('.manage-members'); _b < _c.length; _b++) {
            var button = _c[_b];
            button.addEventListener('click', manageMembers);
        }
        for (var _d = 0, _e = tableElement.querySelectorAll('.edit-user-group'); _d < _e.length; _d++) {
            var button = _e[_d];
            button.addEventListener('click', editUserGroup);
        }
        for (var _f = 0, _g = tableElement.querySelectorAll('.delete-user-group'); _f < _g.length; _f++) {
            var button = _g[_f];
            button.addEventListener('click', deleteUserGroup);
        }
        userGroupsContainerElement.replaceChildren(tableElement);
    }
    (_a = document
        .querySelector('#button--addUserGroup')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        var closeModalFunction;
        function doAddUserGroup(submitEvent) {
            submitEvent.preventDefault();
            var addForm = submitEvent.currentTarget;
            cityssm.postJSON("".concat(shiftLog.urlPrefix, "/admin/doAddUserGroup"), addForm, function (rawResponseJSON) {
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    exports.userGroups = responseJSON.userGroups;
                    renderUserGroups(responseJSON.userGroups);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        title: 'User Group Added',
                        message: 'User group has been successfully created.'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding User Group',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminUserGroups-add', {
            onshown: function (modalElement, _closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddUserGroup);
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderUserGroups(exports.userGroups);
})();
