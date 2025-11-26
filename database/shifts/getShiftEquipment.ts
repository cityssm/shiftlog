import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { ShiftEquipment } from '../../types/record.types.js'

export default async function getShiftEquipment(
  shiftId: number | string,
  user?: User
): Promise<ShiftEquipment[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const sql = /* sql */ `
    select se.shiftId, se.equipmentNumber, se.employeeNumber, se.shiftEquipmentNote,
      eq.equipmentName, eq.userGroupId,
      e.firstName as employeeFirstName, e.lastName as employeeLastName
    from ShiftLog.ShiftEquipment se
    inner join ShiftLog.Equipment eq on se.instance = eq.instance and se.equipmentNumber = eq.equipmentNumber
    left join ShiftLog.Employees e on se.instance = e.instance and se.employeeNumber = e.employeeNumber
    where se.shiftId = @shiftId
      and eq.recordDelete_dateTime is null
      ${
        user === undefined
          ? ''
          : `
            and (
              eq.userGroupId is null or eq.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `
      }
    order by eq.equipmentName
  `

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('userName', user?.userName)
    .query(sql)) as mssql.IResult<ShiftEquipment>

  return result.recordset
}
