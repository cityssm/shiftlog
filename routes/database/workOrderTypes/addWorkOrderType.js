import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addWorkOrderType(form, userName) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('workOrderType', form.workOrderType)
        .input('workOrderNumberPrefix', form.workOrderNumberPrefix ?? '')
        .input('dueDays', form.dueDays === '' || form.dueDays === undefined ? null : form.dueDays)
        .input('userGroupId', form.userGroupId === '' ? null : (form.userGroupId ?? null))
        .input('userName', userName)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.WorkOrderTypes (
          instance,
          workOrderType,
          workOrderNumberPrefix,
          dueDays,
          userGroupId,
          orderNumber,
          recordCreate_userName,
          recordUpdate_userName
        ) output inserted.workOrderTypeId
      VALUES
        (
          @instance,
          @workOrderType,
          @workOrderNumberPrefix,
          @dueDays,
          @userGroupId,
          (
            SELECT
              isnull(max(orderNumber), 0) + 1
            FROM
              ShiftLog.WorkOrderTypes
            WHERE
              instance = @instance
          ),
          @userName,
          @userName
        )
    `);
    return result.recordset[0].workOrderTypeId;
}
