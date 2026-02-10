import { Router } from 'express';
import handler_apiAuditLogs from '../handlers/admin-get/apiAuditLogs.js';
import handler_assignedTo from '../handlers/admin-get/assignedTo.js';
import handler_dataLists from '../handlers/admin-get/dataLists.js';
import handler_employeeLists from '../handlers/admin-get/employeeLists.js';
import handler_employees from '../handlers/admin-get/employees.js';
import handler_equipment from '../handlers/admin-get/equipment.js';
import handler_locations from '../handlers/admin-get/locations.js';
import handler_noteTypes from '../handlers/admin-get/noteTypes.js';
import handler_notificationConfigurations from '../handlers/admin-get/notificationConfigurations.js';
import handler_settings from '../handlers/admin-get/settings.js';
import handler_tags from '../handlers/admin-get/tags.js';
import handler_userGroups from '../handlers/admin-get/userGroups.js';
import handler_users from '../handlers/admin-get/users.js';
import handler_workOrderTypes from '../handlers/admin-get/workOrderTypes.js';
import handler_doAddAssignedToItem from '../handlers/admin-post/doAddAssignedToItem.js';
import handler_doAddDataList from '../handlers/admin-post/doAddDataList.js';
import handler_doAddDataListItem from '../handlers/admin-post/doAddDataListItem.js';
import handler_doAddMultipleDataListItems from '../handlers/admin-post/doAddMultipleDataListItems.js';
import handler_doAddEmployee from '../handlers/admin-post/doAddEmployee.js';
import handler_doAddEmployeeList from '../handlers/admin-post/doAddEmployeeList.js';
import handler_doAddEmployeeListMember from '../handlers/admin-post/doAddEmployeeListMember.js';
import handler_doAddEquipment from '../handlers/admin-post/doAddEquipment.js';
import handler_doAddLocation from '../handlers/admin-post/doAddLocation.js';
import handler_doAddNoteType from '../handlers/admin-post/doAddNoteType.js';
import handler_doAddNoteTypeField from '../handlers/admin-post/doAddNoteTypeField.js';
import handler_doAddNotificationConfiguration from '../handlers/admin-post/doAddNotificationConfiguration.js';
import handler_doAddTag from '../handlers/admin-post/doAddTag.js';
import handler_doAddUser from '../handlers/admin-post/doAddUser.js';
import handler_doAddUserGroup from '../handlers/admin-post/doAddUserGroup.js';
import handler_doAddUserGroupMember from '../handlers/admin-post/doAddUserGroupMember.js';
import handler_doAddWorkOrderType from '../handlers/admin-post/doAddWorkOrderType.js';
import handler_doDeleteAssignedToItem from '../handlers/admin-post/doDeleteAssignedToItem.js';
import handler_doDeleteDataList from '../handlers/admin-post/doDeleteDataList.js';
import handler_doDeleteDataListItem from '../handlers/admin-post/doDeleteDataListItem.js';
import handler_doDeleteEmployee from '../handlers/admin-post/doDeleteEmployee.js';
import handler_doDeleteEmployeeList from '../handlers/admin-post/doDeleteEmployeeList.js';
import handler_doDeleteEmployeeListMember from '../handlers/admin-post/doDeleteEmployeeListMember.js';
import handler_doDeleteEquipment from '../handlers/admin-post/doDeleteEquipment.js';
import handler_doDeleteLocation from '../handlers/admin-post/doDeleteLocation.js';
import handler_doDeleteNoteType from '../handlers/admin-post/doDeleteNoteType.js';
import handler_doDeleteNoteTypeField from '../handlers/admin-post/doDeleteNoteTypeField.js';
import handler_doDeleteNotificationConfiguration from '../handlers/admin-post/doDeleteNotificationConfiguration.js';
import handler_doDeleteTag from '../handlers/admin-post/doDeleteTag.js';
import handler_doDeleteUser from '../handlers/admin-post/doDeleteUser.js';
import handler_doDeleteUserGroup from '../handlers/admin-post/doDeleteUserGroup.js';
import handler_doDeleteUserGroupMember from '../handlers/admin-post/doDeleteUserGroupMember.js';
import handler_doDeleteWorkOrderType from '../handlers/admin-post/doDeleteWorkOrderType.js';
import handler_doGetApiAuditLogs from '../handlers/admin-post/doGetApiAuditLogs.js';
import handler_doGetEmployeeList from '../handlers/admin-post/doGetEmployeeList.js';
import handler_doGetNotificationConfigurations from '../handlers/admin-post/doGetNotificationConfigurations.js';
import handler_doGetOrphanedTags from '../handlers/admin-post/doGetOrphanedTags.js';
import handler_doGetUserGroup from '../handlers/admin-post/doGetUserGroup.js';
import handler_doReorderAssignedToItems from '../handlers/admin-post/doReorderAssignedToItems.js';
import handler_doReorderDataListItems from '../handlers/admin-post/doReorderDataListItems.js';
import handler_doReorderEmployeeListMembers from '../handlers/admin-post/doReorderEmployeeListMembers.js';
import handler_doReorderNoteTypeFields from '../handlers/admin-post/doReorderNoteTypeFields.js';
import handler_doReorderWorkOrderTypes from '../handlers/admin-post/doReorderWorkOrderTypes.js';
import handler_doResetUserApiKey from '../handlers/admin-post/doResetUserApiKey.js';
import handler_doToggleNotificationConfigurationIsActive from '../handlers/admin-post/doToggleNotificationConfigurationIsActive.js';
import handler_doToggleUserPermission from '../handlers/admin-post/doToggleUserPermission.js';
import handler_doUpdateAssignedToItem from '../handlers/admin-post/doUpdateAssignedToItem.js';
import handler_doUpdateDataList from '../handlers/admin-post/doUpdateDataList.js';
import handler_doUpdateDataListItem from '../handlers/admin-post/doUpdateDataListItem.js';
import handler_doUpdateEmployee from '../handlers/admin-post/doUpdateEmployee.js';
import handler_doUpdateEmployeeList from '../handlers/admin-post/doUpdateEmployeeList.js';
import handler_doUpdateEmployeeListMember from '../handlers/admin-post/doUpdateEmployeeListMember.js';
import handler_doUpdateEquipment from '../handlers/admin-post/doUpdateEquipment.js';
import handler_doUpdateLocation from '../handlers/admin-post/doUpdateLocation.js';
import handler_doUpdateNoteType from '../handlers/admin-post/doUpdateNoteType.js';
import handler_doUpdateNoteTypeField from '../handlers/admin-post/doUpdateNoteTypeField.js';
import handler_doUpdateNotificationConfiguration from '../handlers/admin-post/doUpdateNotificationConfiguration.js';
import handler_doUpdateSetting from '../handlers/admin-post/doUpdateSetting.js';
import handler_doUpdateTag from '../handlers/admin-post/doUpdateTag.js';
import handler_doUpdateUser from '../handlers/admin-post/doUpdateUser.js';
import handler_doUpdateUserGroup from '../handlers/admin-post/doUpdateUserGroup.js';
import handler_doUpdateUserSettings from '../handlers/admin-post/doUpdateUserSettings.js';
import handler_doUpdateWorkOrderType from '../handlers/admin-post/doUpdateWorkOrderType.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
export const router = Router();
/*
 * Users
 */
router
    .get('/users', handler_users)
    .post('/doAddUser', handler_doAddUser)
    .post('/doUpdateUser', handler_doUpdateUser)
    .post('/doUpdateUserSettings', handler_doUpdateUserSettings)
    .post('/doToggleUserPermission', handler_doToggleUserPermission)
    .post('/doResetUserApiKey', handler_doResetUserApiKey)
    .post('/doDeleteUser', handler_doDeleteUser);
/*
 * User Groups
 */
router
    .get('/userGroups', handler_userGroups)
    .post('/doGetUserGroup', handler_doGetUserGroup)
    .post('/doAddUserGroup', handler_doAddUserGroup)
    .post('/doUpdateUserGroup', handler_doUpdateUserGroup)
    .post('/doDeleteUserGroup', handler_doDeleteUserGroup)
    .post('/doAddUserGroupMember', handler_doAddUserGroupMember)
    .post('/doDeleteUserGroupMember', handler_doDeleteUserGroupMember);
/*
 * Settings Management
 */
router
    .get('/settings', handler_settings)
    .post('/doUpdateSetting', handler_doUpdateSetting);
/*
 * Notification Configurations
 */
if (getConfigProperty('notifications.protocols').length > 0) {
    router
        .get('/notificationConfigurations', handler_notificationConfigurations)
        .post('/doGetNotificationConfigurations', handler_doGetNotificationConfigurations)
        .post('/doAddNotificationConfiguration', handler_doAddNotificationConfiguration)
        .post('/doUpdateNotificationConfiguration', handler_doUpdateNotificationConfiguration)
        .post('/doDeleteNotificationConfiguration', handler_doDeleteNotificationConfiguration)
        .post('/doToggleNotificationConfigurationIsActive', handler_doToggleNotificationConfigurationIsActive);
}
/*
 * API Audit Logs
 */
router
    .get('/apiAuditLogs', handler_apiAuditLogs)
    .post('/doGetApiAuditLogs', handler_doGetApiAuditLogs);
/*
 * Work Order Type Management
 */
if (getConfigProperty('workOrders.isEnabled')) {
    router
        .get('/workOrderTypes', handler_workOrderTypes)
        .post('/doAddWorkOrderType', handler_doAddWorkOrderType)
        .post('/doUpdateWorkOrderType', handler_doUpdateWorkOrderType)
        .post('/doDeleteWorkOrderType', handler_doDeleteWorkOrderType)
        .post('/doReorderWorkOrderTypes', handler_doReorderWorkOrderTypes);
}
/*
 * Assigned To Management
 */
router
    .get('/assignedTo', handler_assignedTo)
    .post('/doAddAssignedToItem', handler_doAddAssignedToItem)
    .post('/doUpdateAssignedToItem', handler_doUpdateAssignedToItem)
    .post('/doDeleteAssignedToItem', handler_doDeleteAssignedToItem)
    .post('/doReorderAssignedToItems', handler_doReorderAssignedToItems);
/*
 * Tag Management
 */
router
    .get('/tags', handler_tags)
    .post('/doAddTag', handler_doAddTag)
    .post('/doUpdateTag', handler_doUpdateTag)
    .post('/doDeleteTag', handler_doDeleteTag)
    .post('/doGetOrphanedTags', handler_doGetOrphanedTags);
/*
 * Note Type Management
 */
router
    .get('/noteTypes', handler_noteTypes)
    .post('/doAddNoteType', handler_doAddNoteType)
    .post('/doUpdateNoteType', handler_doUpdateNoteType)
    .post('/doDeleteNoteType', handler_doDeleteNoteType)
    .post('/doAddNoteTypeField', handler_doAddNoteTypeField)
    .post('/doUpdateNoteTypeField', handler_doUpdateNoteTypeField)
    .post('/doDeleteNoteTypeField', handler_doDeleteNoteTypeField)
    .post('/doReorderNoteTypeFields', handler_doReorderNoteTypeFields);
/*
 * Data List Management
 */
router
    .get('/dataLists', handler_dataLists)
    .post('/doAddDataList', handler_doAddDataList)
    .post('/doUpdateDataList', handler_doUpdateDataList)
    .post('/doDeleteDataList', handler_doDeleteDataList)
    .post('/doAddDataListItem', handler_doAddDataListItem)
    .post('/doAddMultipleDataListItems', handler_doAddMultipleDataListItems)
    .post('/doUpdateDataListItem', handler_doUpdateDataListItem)
    .post('/doDeleteDataListItem', handler_doDeleteDataListItem)
    .post('/doReorderDataListItems', handler_doReorderDataListItems);
/*
 * Location Maintenance
 */
router
    .get('/locations', handler_locations)
    .post('/doAddLocation', handler_doAddLocation)
    .post('/doUpdateLocation', handler_doUpdateLocation)
    .post('/doDeleteLocation', handler_doDeleteLocation);
if (getConfigProperty('shifts.isEnabled') ||
    getConfigProperty('timesheets.isEnabled')) {
    /*
     * Employees
     */
    router
        .get('/employees', handler_employees)
        .post('/doAddEmployee', handler_doAddEmployee)
        .post('/doUpdateEmployee', handler_doUpdateEmployee)
        .post('/doDeleteEmployee', handler_doDeleteEmployee);
    /*
     * Employee Lists
     */
    router
        .get('/employeeLists', handler_employeeLists)
        .post('/doGetEmployeeList', handler_doGetEmployeeList)
        .post('/doAddEmployeeList', handler_doAddEmployeeList)
        .post('/doUpdateEmployeeList', handler_doUpdateEmployeeList)
        .post('/doDeleteEmployeeList', handler_doDeleteEmployeeList)
        .post('/doAddEmployeeListMember', handler_doAddEmployeeListMember)
        .post('/doUpdateEmployeeListMember', handler_doUpdateEmployeeListMember)
        .post('/doDeleteEmployeeListMember', handler_doDeleteEmployeeListMember)
        .post('/doReorderEmployeeListMembers', handler_doReorderEmployeeListMembers);
    /*
     * Equipment Management
     */
    router
        .get('/equipment', handler_equipment)
        .post('/doAddEquipment', handler_doAddEquipment)
        .post('/doUpdateEquipment', handler_doUpdateEquipment)
        .post('/doDeleteEquipment', handler_doDeleteEquipment);
}
export default router;
