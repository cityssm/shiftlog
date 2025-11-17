import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getShiftEmployees(shiftId, user) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const sql = /* sql */ `
    select se.shiftId, se.employeeNumber, se.crewId, se.shiftEmployeeNote,
      e.firstName, e.lastName, e.userGroupId,
      c.crewName
    from ShiftLog.ShiftEmployees se
    inner join ShiftLog.Employees e on se.employeeNumber = e.employeeNumber
    left join ShiftLog.Crews c on se.crewId = c.crewId
    where se.shiftId = @shiftId
      and e.recordDelete_dateTime is null
    ${user === undefined
        ? ''
        : `
          and (
            e.userGroupId is null or e.userGroupId in (
              select userGroupId
              from ShiftLog.UserGroupMembers
              where userName = @userName
            )
          )
        `}
    order by e.lastName, e.firstName
  `;
    const result = (await pool
        .request()
        .input('shiftId', shiftId)
        .input('userName', user?.userName)
        .query(sql));
    return result.recordset;
}
