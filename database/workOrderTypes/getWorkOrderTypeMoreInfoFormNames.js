/* eslint-disable no-secrets/no-secrets */
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderTypeMoreInfoFormNames(workOrderTypeId) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('workOrderTypeId', workOrderTypeId)
        .query(/* sql */ `
      SELECT
        formName
      FROM
        ShiftLog.WorkOrderTypeMoreInfoForms
      WHERE
        workOrderTypeId = @workOrderTypeId
    `);
    return result.recordset.map((row) => row.formName);
}
