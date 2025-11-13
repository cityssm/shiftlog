import { Router } from 'express'

import handler_dataLists from '../handlers/admin-get/dataLists.js'
import handler_settings from '../handlers/admin-get/settings.js'
import handler_users from '../handlers/admin-get/users.js'
import handler_doAddDataListItem from '../handlers/admin-post/doAddDataListItem.js'
import handler_doAddUser from '../handlers/admin-post/doAddUser.js'
import handler_doDeleteDataListItem from '../handlers/admin-post/doDeleteDataListItem.js'
import handler_doDeleteUser from '../handlers/admin-post/doDeleteUser.js'
import handler_doReorderDataListItems from '../handlers/admin-post/doReorderDataListItems.js'
import handler_doToggleUserPermission from '../handlers/admin-post/doToggleUserPermission.js'
import handler_doUpdateDataListItem from '../handlers/admin-post/doUpdateDataListItem.js'
import handler_doUpdateSetting from '../handlers/admin-post/doUpdateSetting.js'
import handler_doUpdateUser from '../handlers/admin-post/doUpdateUser.js'
import handler_doUpdateUserSettings from '../handlers/admin-post/doUpdateUserSettings.js'

export const router = Router()

/*
 * Users
 */

router
  .get('/users', handler_users)
  .post('/doAddUser', handler_doAddUser)
  .post('/doUpdateUser', handler_doUpdateUser)
  .post('/doUpdateUserSettings', handler_doUpdateUserSettings)
  .post('/doToggleUserPermission', handler_doToggleUserPermission)
  .post('/doDeleteUser', handler_doDeleteUser)

/*
 * Settings Management
 */

router
  .get('/settings', handler_settings)
  .post('/doUpdateSetting', handler_doUpdateSetting)

/*
 * Data List Management
 */

router
  .get('/dataLists', handler_dataLists)
  .post('/doAddDataListItem', handler_doAddDataListItem)
  .post('/doUpdateDataListItem', handler_doUpdateDataListItem)
  .post('/doDeleteDataListItem', handler_doDeleteDataListItem)
  .post('/doReorderDataListItems', handler_doReorderDataListItems)

export default router
