// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getDeletedTimesheets(options, user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = 'where t.instance = @instance and t.recordDelete_dateTime is not null';
    if (user !== undefined) {
        whereClause += `
      and (
        tType.userGroupId is null or tType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `;
    }
    const limit = typeof options.limit === 'string'
        ? Number.parseInt(options.limit, 10)
        : options.limit;
    const offset = typeof options.offset === 'string'
        ? Number.parseInt(options.offset, 10)
        : options.offset;
    // Get total count if limit === -1
    let totalCount = 0;
    if (limit !== -1) {
        const countSql = /* sql */ `
      select count(*) as totalCount
      from ShiftLog.Timesheets t
      left join ShiftLog.DataListItems tType
        on t.timesheetTypeDataListItemId = tType.dataListItemId
      ${whereClause}
    `;
        const countResult = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', user?.userName)
            .query(countSql);
        totalCount = countResult.recordset[0]?.totalCount ?? 0;
    }
    // Main query with limit and offset
    let timesheets = [];
    if (totalCount > 0 || limit === -1) {
        const timesheetsResult = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', user?.userName).query(/* sql */ `
        select
          t.timesheetId,
          t.timesheetDate,

          t.timesheetTypeDataListItemId,
          tType.dataListItem as timesheetTypeDataListItem,

          t.supervisorEmployeeNumber,
          supervisor.employeeSurname as supervisorEmployeeSurname,
          supervisor.employeeGivenName as supervisorEmployeeGivenName,

          t.timesheetDetails,

          t.recordDelete_userName,
          t.recordDelete_dateTime

        from ShiftLog.Timesheets t

        left join ShiftLog.DataListItems tType
          on t.timesheetTypeDataListItemId = tType.dataListItemId

        left join ShiftLog.Employees supervisor
          on t.supervisorEmployeeNumber = supervisor.employeeNumber
            and t.instance = supervisor.instance

        ${whereClause}

        order by t.recordDelete_dateTime desc

        ${limit === -1 ? '' : ` offset ${offset} rows`}
        ${limit === -1 ? '' : ` fetch next ${limit} rows only`}
      `);
        timesheets = timesheetsResult.recordset;
        if (limit === -1) {
            totalCount = timesheets.length;
        }
    }
    return {
        timesheets,
        totalCount
    };
}
