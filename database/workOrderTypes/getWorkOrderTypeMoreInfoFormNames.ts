// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function getWorkOrderTypeMoreInfoFormNames(
  workOrderTypeId: number | string
): Promise<string[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool.request().input('workOrderTypeId', workOrderTypeId)
    .query<{ formName: string }>(/* sql */ `
      select
        formName
      from ShiftLog.WorkOrderTypeMoreInfoForms
      where workOrderTypeId = @workOrderTypeId
    `)

  return result.recordset.map((row) => row.formName)
}
