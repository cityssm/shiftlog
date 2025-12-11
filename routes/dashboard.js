import { Router } from 'express';
import handler_dashboard from '../handlers/dashboard-get/dashboard.js';
import handler_reports from '../handlers/dashboard-get/reports.js';
import handler_userSettings from '../handlers/dashboard-get/userSettings.js';
import handler_doCreateScheduledReport from '../handlers/dashboard-post/doCreateScheduledReport.js';
import handler_doDeleteScheduledReport from '../handlers/dashboard-post/doDeleteScheduledReport.js';
import handler_doGetUserScheduledReports from '../handlers/dashboard-post/doGetUserScheduledReports.js';
import handler_doResetApiKey from '../handlers/dashboard-post/doResetApiKey.js';
import handler_doUpdateScheduledReport from '../handlers/dashboard-post/doUpdateScheduledReport.js';
import handler_doUpdateUserSetting from '../handlers/dashboard-post/doUpdateUserSetting.js';
export const router = Router();
router.get('/', handler_dashboard);
// Reports
router.get('/reports', handler_reports);
// User Settings
router
    .get('/userSettings', handler_userSettings)
    .post('/doResetApiKey', handler_doResetApiKey)
    .post('/doUpdateUserSetting', handler_doUpdateUserSetting)
    .post('/doGetUserScheduledReports', handler_doGetUserScheduledReports)
    .post('/doCreateScheduledReport', handler_doCreateScheduledReport)
    .post('/doUpdateScheduledReport', handler_doUpdateScheduledReport)
    .post('/doDeleteScheduledReport', handler_doDeleteScheduledReport);
export default router;
