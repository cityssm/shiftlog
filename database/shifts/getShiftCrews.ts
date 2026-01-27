import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import type { ShiftCrew } from '../../types/record.types.js'

export default async function getShiftCrews(
  shiftId: number | string,
  user?: User
): Promise<ShiftCrew[]> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const sql = /* sql */ `
    SELECT
      sc.shiftId,
      sc.crewId,
      sc.shiftCrewNote,
      c.crewName,
      c.userGroupId
    FROM
      ShiftLog.ShiftCrews sc
      INNER JOIN ShiftLog.Crews c ON sc.crewId = c.crewId
    WHERE
      sc.shiftId = @shiftId
      AND c.recordDelete_dateTime IS NULL ${user === undefined
        ? ''
        : `
            and (
              c.userGroupId is null or c.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
          `}
    ORDER BY
      c.crewName
  `

  const result = (await pool
    .request()
    .input('shiftId', shiftId)
    .input('userName', user?.userName)
    .query(sql)) as mssql.IResult<ShiftCrew>

  return result.recordset
}
