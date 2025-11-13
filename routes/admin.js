"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
var settings_js_1 = require("../handlers/admin-get/settings.js");
var userGroup_js_1 = require("../handlers/admin-get/userGroup.js");
var userGroups_js_1 = require("../handlers/admin-get/userGroups.js");
var users_js_1 = require("../handlers/admin-get/users.js");
var doAddUser_js_1 = require("../handlers/admin-post/doAddUser.js");
var doAddUserGroup_js_1 = require("../handlers/admin-post/doAddUserGroup.js");
var doAddUserGroupMember_js_1 = require("../handlers/admin-post/doAddUserGroupMember.js");
var doDeleteUser_js_1 = require("../handlers/admin-post/doDeleteUser.js");
var doDeleteUserGroup_js_1 = require("../handlers/admin-post/doDeleteUserGroup.js");
var doDeleteUserGroupMember_js_1 = require("../handlers/admin-post/doDeleteUserGroupMember.js");
var doToggleUserPermission_js_1 = require("../handlers/admin-post/doToggleUserPermission.js");
var doUpdateSetting_js_1 = require("../handlers/admin-post/doUpdateSetting.js");
var doUpdateUser_js_1 = require("../handlers/admin-post/doUpdateUser.js");
var doUpdateUserGroup_js_1 = require("../handlers/admin-post/doUpdateUserGroup.js");
var doUpdateUserSettings_js_1 = require("../handlers/admin-post/doUpdateUserSettings.js");
exports.router = (0, express_1.Router)();
/*
 * Users
 */
exports.router
    .get('/users', users_js_1.default)
    .post('/doAddUser', doAddUser_js_1.default)
    .post('/doUpdateUser', doUpdateUser_js_1.default)
    .post('/doUpdateUserSettings', doUpdateUserSettings_js_1.default)
    .post('/doToggleUserPermission', doToggleUserPermission_js_1.default)
    .post('/doDeleteUser', doDeleteUser_js_1.default);
/*
 * User Groups
 */
exports.router
    .get('/userGroups', userGroups_js_1.default)
    .get('/userGroup/:userGroupId', userGroup_js_1.default)
    .post('/doAddUserGroup', doAddUserGroup_js_1.default)
    .post('/doUpdateUserGroup', doUpdateUserGroup_js_1.default)
    .post('/doDeleteUserGroup', doDeleteUserGroup_js_1.default)
    .post('/doAddUserGroupMember', doAddUserGroupMember_js_1.default)
    .post('/doDeleteUserGroupMember', doDeleteUserGroupMember_js_1.default);
/*
 * Settings Management
 */
exports.router
    .get('/settings', settings_js_1.default)
    .post('/doUpdateSetting', doUpdateSetting_js_1.default);
exports.default = exports.router;
