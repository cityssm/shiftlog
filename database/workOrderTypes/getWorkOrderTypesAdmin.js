import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import getWorkOrderTypeDefaultMilestones from './getWorkOrderTypeDefaultMilestones.js';
import getWorkOrderTypeMoreInfoFormNames from './getWorkOrderTypeMoreInfoFormNames.js';
export default async function getWorkOrderTypesAdmin() {
    const pool = await getShiftLogConnectionPool();
    const workOrderTypesResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .query(/* sql */ `
      SELECT
        wt.workOrderTypeId,
        wt.workOrderType,
        wt.workOrderNumberPrefix,
        wt.dueDays,
        wt.orderNumber,
        wt.userGroupId,
        ug.userGroupName
      FROM
        ShiftLog.WorkOrderTypes wt
        LEFT JOIN ShiftLog.UserGroups ug ON wt.userGroupId = ug.userGroupId
      WHERE
        wt.instance = @instance
        AND wt.recordDelete_dateTime IS NULL
      ORDER BY
        wt.orderNumber,
        wt.workOrderType
    `);
    const workOrderTypes = workOrderTypesResult.recordset;
    for (const workOrderType of workOrderTypes) {
        workOrderType.moreInfoFormNames = await getWorkOrderTypeMoreInfoFormNames(workOrderType.workOrderTypeId);
        workOrderType.defaultMilestones = await getWorkOrderTypeDefaultMilestones(workOrderType.workOrderTypeId);
    }
    return workOrderTypes;
}
