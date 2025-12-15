import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
const maxResults = 10;
export default async function getPreviousShifts(filters, user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = `
    where s.instance = @instance
      and s.recordDelete_dateTime is null
      and s.shiftId <> @currentShiftId
  `;
    // Add optional filters
    if (filters.shiftTypeDataListItemId !== undefined &&
        filters.shiftTypeDataListItemId !== '') {
        whereClause += ' and s.shiftTypeDataListItemId = @shiftTypeDataListItemId';
    }
    if (filters.supervisorEmployeeNumber !== undefined &&
        filters.supervisorEmployeeNumber !== '') {
        whereClause += ' and s.supervisorEmployeeNumber = @supervisorEmployeeNumber';
    }
    if (filters.shiftTimeDataListItemId !== undefined &&
        filters.shiftTimeDataListItemId !== '') {
        whereClause += ' and s.shiftTimeDataListItemId = @shiftTimeDataListItemId';
    }
    if (filters.shiftDateString !== undefined &&
        filters.shiftDateString !== '') {
        whereClause += ' and s.shiftDate < @shiftDateString';
    }
    // User group filter
    whereClause += `
    and (
      sType.userGroupId is null or sType.userGroupId in (
        select userGroupId
        from ShiftLog.UserGroupMembers
        where userName = @userName
      )
    )
  `;
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('currentShiftId', filters.currentShiftId)
        .input('shiftTypeDataListItemId', filters.shiftTypeDataListItemId ?? undefined)
        .input('supervisorEmployeeNumber', filters.supervisorEmployeeNumber ?? undefined)
        .input('shiftTimeDataListItemId', filters.shiftTimeDataListItemId ?? undefined)
        .input('shiftDateString', filters.shiftDateString ?? undefined)
        .input('userName', user.userName).query(/* sql */ `
      select top ${maxResults}
        s.shiftId,
        s.shiftDate,
        
        s.shiftTimeDataListItemId,
        sTime.dataListItem as shiftTimeDataListItem,
        
        s.shiftTypeDataListItemId,
        sType.dataListItem as shiftTypeDataListItem,
        
        s.supervisorEmployeeNumber,
        e.firstName as supervisorFirstName,
        e.lastName as supervisorLastName,
        
        s.shiftDescription,
        
        -- Counts
        (select count(*) from ShiftLog.ShiftCrews sc where sc.shiftId = s.shiftId) as crewsCount,
        (select count(*) from ShiftLog.ShiftEmployees se where se.shiftId = s.shiftId) as employeesCount,
        (select count(*) from ShiftLog.ShiftEquipment seq where seq.shiftId = s.shiftId) as equipmentCount
        
      from ShiftLog.Shifts s
      
      left join ShiftLog.DataListItems sTime
        on s.shiftTimeDataListItemId = sTime.dataListItemId
      
      left join ShiftLog.DataListItems sType
        on s.shiftTypeDataListItemId = sType.dataListItemId
        
      left join ShiftLog.Employees e
        on s.instance = e.instance
        and s.supervisorEmployeeNumber = e.employeeNumber
      
      ${whereClause}
      
      order by s.shiftDate desc, s.shiftId desc
    `);
    return result.recordset;
}
