import { Router } from 'express'

import handler_dashboard from '../handlers/dashboard-get/dashboard.js'
import handler_reports from '../handlers/dashboard-get/reports.js'
import handler_userSettings from '../handlers/dashboard-get/userSettings.js'
import handler_doResetApiKey from '../handlers/dashboard-post/doResetApiKey.js'

export const router = Router()

router.get('/', handler_dashboard)

// Reports

router.get('/reports', handler_reports)

// User Settings

router
  .get('/userSettings', handler_userSettings)
  .post('/doResetApiKey', handler_doResetApiKey)

export default router
