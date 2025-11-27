import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import workOrderReports from './workOrder.reports.js';
const reports = {
    ...workOrderReports
};
function userHasReportAccess(reportKey, user) {
    if (reportKey.startsWith('workOrders-')) {
        return user.workOrders_canView;
    }
    return false;
}
export default async function getReportData(reportKey, reportParameters, user) {
    if (!userHasReportAccess(reportKey, user)) {
        return undefined;
    }
    const reportDefinition = reports[reportKey];
    if (reportDefinition === undefined) {
        return undefined;
    }
    const pool = await getShiftLogConnectionPool();
    const request = pool.request();
    // Add standard parameters
    request.input('instance', getConfigProperty('application.instance'));
    request.input('userName', user.userName);
    // Add report parameters
    for (const parameterName of reportDefinition.parameterNames) {
        // eslint-disable-next-line security/detect-object-injection
        const parameterValue = reportParameters[parameterName];
        request.input(parameterName, parameterValue);
    }
    const result = await request.query(reportDefinition.sql);
    return result.recordset;
}
