"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
var express_1 = require("express");
var apiAuditLogs_js_1 = require("../handlers/admin-get/apiAuditLogs.js");
var dataLists_js_1 = require("../handlers/admin-get/dataLists.js");
var employees_js_1 = require("../handlers/admin-get/employees.js");
var employeeLists_js_1 = require("../handlers/admin-get/employeeLists.js");
var equipment_js_1 = require("../handlers/admin-get/equipment.js");
var locations_js_1 = require("../handlers/admin-get/locations.js");
var settings_js_1 = require("../handlers/admin-get/settings.js");
var tags_js_1 = require("../handlers/admin-get/tags.js");
var userGroups_js_1 = require("../handlers/admin-get/userGroups.js");
var users_js_1 = require("../handlers/admin-get/users.js");
var workOrderTypes_js_1 = require("../handlers/admin-get/workOrderTypes.js");
var doAddDataListItem_js_1 = require("../handlers/admin-post/doAddDataListItem.js");
var doAddEmployee_js_1 = require("../handlers/admin-post/doAddEmployee.js");
var doAddEmployeeList_js_1 = require("../handlers/admin-post/doAddEmployeeList.js");
var doAddEmployeeListMember_js_1 = require("../handlers/admin-post/doAddEmployeeListMember.js");
var doAddEquipment_js_1 = require("../handlers/admin-post/doAddEquipment.js");
var doAddLocation_js_1 = require("../handlers/admin-post/doAddLocation.js");
var doAddTag_js_1 = require("../handlers/admin-post/doAddTag.js");
var doGetApiAuditLogs_js_1 = require("../handlers/admin-post/doGetApiAuditLogs.js");
var doGetOrphanedTags_js_1 = require("../handlers/admin-post/doGetOrphanedTags.js");
var doAddUser_js_1 = require("../handlers/admin-post/doAddUser.js");
var doAddUserGroup_js_1 = require("../handlers/admin-post/doAddUserGroup.js");
var doAddUserGroupMember_js_1 = require("../handlers/admin-post/doAddUserGroupMember.js");
var doAddWorkOrderType_js_1 = require("../handlers/admin-post/doAddWorkOrderType.js");
var doDeleteDataListItem_js_1 = require("../handlers/admin-post/doDeleteDataListItem.js");
var doDeleteEmployee_js_1 = require("../handlers/admin-post/doDeleteEmployee.js");
var doDeleteEmployeeList_js_1 = require("../handlers/admin-post/doDeleteEmployeeList.js");
var doDeleteEmployeeListMember_js_1 = require("../handlers/admin-post/doDeleteEmployeeListMember.js");
var doDeleteEquipment_js_1 = require("../handlers/admin-post/doDeleteEquipment.js");
var doDeleteLocation_js_1 = require("../handlers/admin-post/doDeleteLocation.js");
var doDeleteTag_js_1 = require("../handlers/admin-post/doDeleteTag.js");
var doDeleteUser_js_1 = require("../handlers/admin-post/doDeleteUser.js");
var doDeleteUserGroup_js_1 = require("../handlers/admin-post/doDeleteUserGroup.js");
var doDeleteUserGroupMember_js_1 = require("../handlers/admin-post/doDeleteUserGroupMember.js");
var doDeleteWorkOrderType_js_1 = require("../handlers/admin-post/doDeleteWorkOrderType.js");
var doGetEmployeeList_js_1 = require("../handlers/admin-post/doGetEmployeeList.js");
var doGetUserGroup_js_1 = require("../handlers/admin-post/doGetUserGroup.js");
var doReorderDataListItems_js_1 = require("../handlers/admin-post/doReorderDataListItems.js");
var doReorderEmployeeListMembers_js_1 = require("../handlers/admin-post/doReorderEmployeeListMembers.js");
var doReorderWorkOrderTypes_js_1 = require("../handlers/admin-post/doReorderWorkOrderTypes.js");
var doToggleUserPermission_js_1 = require("../handlers/admin-post/doToggleUserPermission.js");
var doUpdateDataListItem_js_1 = require("../handlers/admin-post/doUpdateDataListItem.js");
var doUpdateEmployee_js_1 = require("../handlers/admin-post/doUpdateEmployee.js");
var doUpdateEmployeeList_js_1 = require("../handlers/admin-post/doUpdateEmployeeList.js");
var doUpdateEmployeeListMember_js_1 = require("../handlers/admin-post/doUpdateEmployeeListMember.js");
var doUpdateEquipment_js_1 = require("../handlers/admin-post/doUpdateEquipment.js");
var doUpdateLocation_js_1 = require("../handlers/admin-post/doUpdateLocation.js");
var doUpdateSetting_js_1 = require("../handlers/admin-post/doUpdateSetting.js");
var doUpdateTag_js_1 = require("../handlers/admin-post/doUpdateTag.js");
var doUpdateUser_js_1 = require("../handlers/admin-post/doUpdateUser.js");
var doUpdateUserGroup_js_1 = require("../handlers/admin-post/doUpdateUserGroup.js");
var doUpdateUserSettings_js_1 = require("../handlers/admin-post/doUpdateUserSettings.js");
var doUpdateWorkOrderType_js_1 = require("../handlers/admin-post/doUpdateWorkOrderType.js");
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
    .post('/doGetUserGroup', doGetUserGroup_js_1.default)
    .post('/doAddUserGroup', doAddUserGroup_js_1.default)
    .post('/doUpdateUserGroup', doUpdateUserGroup_js_1.default)
    .post('/doDeleteUserGroup', doDeleteUserGroup_js_1.default)
    .post('/doAddUserGroupMember', doAddUserGroupMember_js_1.default)
    .post('/doDeleteUserGroupMember', doDeleteUserGroupMember_js_1.default);
/*
 * Employees
 */
exports.router
    .get('/employees', employees_js_1.default)
    .post('/doAddEmployee', doAddEmployee_js_1.default)
    .post('/doUpdateEmployee', doUpdateEmployee_js_1.default)
    .post('/doDeleteEmployee', doDeleteEmployee_js_1.default);
/*
 * Employee Lists
 */
exports.router
    .get('/employeeLists', employeeLists_js_1.default)
    .post('/doGetEmployeeList', doGetEmployeeList_js_1.default)
    .post('/doAddEmployeeList', doAddEmployeeList_js_1.default)
    .post('/doUpdateEmployeeList', doUpdateEmployeeList_js_1.default)
    .post('/doDeleteEmployeeList', doDeleteEmployeeList_js_1.default)
    .post('/doAddEmployeeListMember', doAddEmployeeListMember_js_1.default)
    .post('/doUpdateEmployeeListMember', doUpdateEmployeeListMember_js_1.default)
    .post('/doDeleteEmployeeListMember', doDeleteEmployeeListMember_js_1.default)
    .post('/doReorderEmployeeListMembers', doReorderEmployeeListMembers_js_1.default);
/*
 * Settings Management
 */
exports.router
    .get('/settings', settings_js_1.default)
    .post('/doUpdateSetting', doUpdateSetting_js_1.default);
/*
 * Equipment Management
 */
exports.router
    .get('/equipment', equipment_js_1.default)
    .post('/doAddEquipment', doAddEquipment_js_1.default)
    .post('/doUpdateEquipment', doUpdateEquipment_js_1.default)
    .post('/doDeleteEquipment', doDeleteEquipment_js_1.default);
/*
 * Location Maintenance
 */
exports.router
    .get('/locations', locations_js_1.default)
    .post('/doAddLocation', doAddLocation_js_1.default)
    .post('/doUpdateLocation', doUpdateLocation_js_1.default)
    .post('/doDeleteLocation', doDeleteLocation_js_1.default);
/*
 * Work Order Type Management
 */
exports.router
    .get('/workOrderTypes', workOrderTypes_js_1.default)
    .post('/doAddWorkOrderType', doAddWorkOrderType_js_1.default)
    .post('/doUpdateWorkOrderType', doUpdateWorkOrderType_js_1.default)
    .post('/doDeleteWorkOrderType', doDeleteWorkOrderType_js_1.default)
    .post('/doReorderWorkOrderTypes', doReorderWorkOrderTypes_js_1.default);
/*
 * Data List Management
 */
exports.router
    .get('/dataLists', dataLists_js_1.default)
    .post('/doAddDataListItem', doAddDataListItem_js_1.default)
    .post('/doUpdateDataListItem', doUpdateDataListItem_js_1.default)
    .post('/doDeleteDataListItem', doDeleteDataListItem_js_1.default)
    .post('/doReorderDataListItems', doReorderDataListItems_js_1.default);
/*
 * Tag Management
 */
exports.router
    .get('/tags', tags_js_1.default)
    .post('/doAddTag', doAddTag_js_1.default)
    .post('/doUpdateTag', doUpdateTag_js_1.default)
    .post('/doDeleteTag', doDeleteTag_js_1.default)
    .post('/doGetOrphanedTags', doGetOrphanedTags_js_1.default);
/*
 * API Audit Logs
 */
exports.router
    .get('/apiAuditLogs', apiAuditLogs_js_1.default)
    .post('/doGetApiAuditLogs', doGetApiAuditLogs_js_1.default);
exports.default = exports.router;
