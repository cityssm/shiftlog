import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { ShiftEquipment } from '../../types/record.types.js'

export default async function getShiftEquipment(
  shiftId: number | string,
  user?: User
): Promise<ShiftEquipment[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const sql = /* sql */ `
    SELECT
      se.shiftId,
      se.equipmentNumber,
      se.employeeNumber,
      se.shiftEquipmentNote,
      eq.equipmentName,
      eq.userGroupId,
      e.firstName AS employeeFirstName,
      e.lastName AS employeeLastName
    FROM
      ShiftLog.ShiftEquipment se
      INNER JOIN ShiftLog.Equipment eq ON se.instance = eq.instance
      AND se.equipmentNumber = eq.equipmentNumber
      LEFT JOIN ShiftLog.Employees e ON se.instance = e.instance
      AND se.employeeNumber = e.employeeNumber
    WHERE
      se.shiftId = @shiftId
      AND eq.recordDelete_dateTime IS NULL ${user === undefined
        ? ''
        : /* sql */ `
            AND (
              eq.userGroupId IS NULL
              OR eq.userGroupId IN (
                SELECT
                  userGroupId
                FROM
                  ShiftLog.UserGroupMembers
                WHERE
                  userName = @userName
              )
            )
          `}
    ORDER BY
      eq.equipmentName
  `

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('userName', user?.userName)
    .query(sql)) as mssql.IResult<ShiftEquipment>

  return result.recordset
}
