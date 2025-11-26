import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { ShiftEmployee } from '../../types/record.types.js'

export default async function getShiftEmployees(
  shiftId: number | string,
  user?: User
): Promise<ShiftEmployee[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const sql = /* sql */ `
    select se.shiftId, se.employeeNumber, se.crewId, se.shiftEmployeeNote,
      e.firstName, e.lastName, e.userGroupId,
      c.crewName
    from ShiftLog.ShiftEmployees se
    inner join ShiftLog.Employees e on se.instance = e.instance and se.employeeNumber = e.employeeNumber
    left join ShiftLog.Crews c on se.crewId = c.crewId
    where se.shiftId = @shiftId
      and e.recordDelete_dateTime is null
      ${
        user === undefined
          ? ''
          : `
            and (
              e.userGroupId is null or e.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `
      }
    order by e.lastName, e.firstName
  `

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('userName', user?.userName)
    .query(sql)) as mssql.IResult<ShiftEmployee>

  return result.recordset
}
