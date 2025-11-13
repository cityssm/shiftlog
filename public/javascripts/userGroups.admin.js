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
            var _this = this;
            fetch("".concat(shiftLog.urlPrefix, "/admin/userGroup/").concat(userGroupId))
                .then(function (response) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, response.json()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            }); }); })
                .then(function (responseJSON) {
                var _a;
                if (responseJSON.userGroup !== undefined) {
                    currentMembers = (_a = responseJSON.userGroup.members) !== null && _a !== void 0 ? _a : [];
                    renderMembersList();
                }
            })
                .catch(function () {
                // Error handling
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
            var removeButtons = membersContainer.querySelectorAll('.remove-member');
            for (var _i = 0, _a = Array.from(removeButtons); _i < _a.length; _i++) {
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
                var _this = this;
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
                fetch("".concat(shiftLog.urlPrefix, "/admin/userGroup/").concat(userGroupId))
                    .then(function (response) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, response.json()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); })
                    .then(function (responseJSON) {
                    var _a;
                    if (responseJSON.userGroup !== undefined) {
                        currentMembers = (_a = responseJSON.userGroup.members) !== null && _a !== void 0 ? _a : [];
                        renderMembersList();
                    }
                })
                    .catch(function () {
                    // Error handling
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
        var manageMembersButtons = tableElement.querySelectorAll('.manage-members');
        for (var _b = 0, _c = Array.from(manageMembersButtons); _b < _c.length; _b++) {
            var button = _c[_b];
            button.addEventListener('click', manageMembers);
        }
        var editButtons = tableElement.querySelectorAll('.edit-user-group');
        for (var _d = 0, _e = Array.from(editButtons); _d < _e.length; _d++) {
            var button = _e[_d];
            button.addEventListener('click', editUserGroup);
        }
        var deleteButtons = tableElement.querySelectorAll('.delete-user-group');
        for (var _f = 0, _g = Array.from(deleteButtons); _f < _g.length; _f++) {
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
