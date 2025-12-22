import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getShiftsForBuilder(shiftDateString, user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = `
    where s.instance = @instance
    and s.recordDelete_dateTime is null
    and s.shiftDate = @shiftDateString
  `;
    if (user !== undefined) {
        whereClause += `
      and (
        sType.userGroupId is null or sType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `;
    }
    const sql = /* sql */ `
    select
      s.shiftId,
      s.shiftDate,
      s.shiftTimeDataListItemId,
      sTime.dataListItem as shiftTimeDataListItem,
      s.shiftTypeDataListItemId,
      sType.dataListItem as shiftTypeDataListItem,
      s.supervisorEmployeeNumber,
      sup.firstName as supervisorFirstName,
      sup.lastName as supervisorLastName,
      sup.userName as supervisorUserName,
      s.shiftDescription,
      s.recordCreate_userName,
      s.recordCreate_dateTime,
      s.recordUpdate_userName,
      s.recordUpdate_dateTime,
      s.recordLock_dateTime
    from ShiftLog.Shifts s
    left join ShiftLog.DataListItems sTime
      on s.shiftTimeDataListItemId = sTime.dataListItemId
    left join ShiftLog.DataListItems sType
      on s.shiftTypeDataListItemId = sType.dataListItemId
    left join ShiftLog.Employees sup
      on s.supervisorEmployeeNumber = sup.employeeNumber
      and s.instance = sup.instance
    ${whereClause}
    order by s.shiftTimeDataListItemId, s.shiftTypeDataListItemId
  `;
    const shiftsResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('shiftDateString', shiftDateString)
        .input('userName', user?.userName)
        .query(sql);
    const shifts = shiftsResult.recordset;
    // Get crews, employees, equipment, and work orders for all shifts
    const shiftIds = shifts.map((shift) => shift.shiftId);
    if (shiftIds.length === 0) {
        return [];
    }
    // Get crews
    const crewsSql = /* sql */ `
    select
      sc.shiftId,
      sc.crewId,
      c.crewName,
      sc.shiftCrewNote
    from ShiftLog.ShiftCrews sc
    inner join ShiftLog.Crews c
      on sc.crewId = c.crewId
    where sc.shiftId in (${shiftIds.join(',')})
    and c.recordDelete_dateTime is null
    order by c.crewName
  `;
    const crewsResult = await pool.request().query(crewsSql);
    // Get employees
    const employeesSql = /* sql */ `
    select
      se.shiftId,
      se.employeeNumber,
      e.firstName,
      e.lastName,
      se.crewId,
      c.crewName,
      se.shiftEmployeeNote,
      e.isSupervisor
    from ShiftLog.ShiftEmployees se
    inner join ShiftLog.Employees e
      on se.employeeNumber = e.employeeNumber
      and se.instance = e.instance
    left join ShiftLog.Crews c
      on se.crewId = c.crewId
    where se.shiftId in (${shiftIds.join(',')})
    and e.recordDelete_dateTime is null
    order by e.lastName, e.firstName
  `;
    const employeesResult = await pool.request().query(employeesSql);
    // Get equipment
    const equipmentSql = /* sql */ `
    select
      seq.shiftId,
      seq.equipmentNumber,
      eq.equipmentName,
      seq.employeeNumber,
      e.firstName as employeeFirstName,
      e.lastName as employeeLastName,
      seq.shiftEquipmentNote
    from ShiftLog.ShiftEquipment seq
    inner join ShiftLog.Equipment eq
      on seq.equipmentNumber = eq.equipmentNumber
      and seq.instance = eq.instance
    left join ShiftLog.Employees e
      on seq.employeeNumber = e.employeeNumber
      and seq.instance = e.instance
    where seq.shiftId in (${shiftIds.join(',')})
    and eq.recordDelete_dateTime is null
    order by eq.equipmentName
  `;
    const equipmentResult = await pool.request().query(equipmentSql);
    // Get work orders
    const workOrdersSql = /* sql */ `
    select
      sw.shiftId,
      sw.workOrderId,
      wo.workOrderNumber,
      wo.workOrderDetails,
      sw.shiftWorkOrderNote
    from ShiftLog.ShiftWorkOrders sw
    inner join ShiftLog.WorkOrders wo
      on sw.workOrderId = wo.workOrderId
    where sw.shiftId in (${shiftIds.join(',')})
    and wo.recordDelete_dateTime is null
    order by wo.workOrderNumber
  `;
    const workOrdersResult = await pool.request().query(workOrdersSql);
    // Get adhoc tasks
    const adhocTasksSql = /* sql */ `
    select
      st.shiftId,
      st.adhocTaskId,
      t.adhocTaskTypeDataListItemId,
      td.dataListItem as adhocTaskTypeDataListItem,
      t.taskDescription,
      t.locationAddress1,
      t.locationAddress2,
      t.locationCityProvince,
      t.taskDueDateTime,
      st.shiftAdhocTaskNote
    from ShiftLog.ShiftAdhocTasks st
    inner join ShiftLog.AdhocTasks t
      on st.adhocTaskId = t.adhocTaskId
    left join ShiftLog.DataListItems td
      on t.adhocTaskTypeDataListItemId = td.dataListItemId
    where st.shiftId in (${shiftIds.join(',')})
    and t.recordDelete_dateTime is null
    order by t.taskDueDateTime, t.recordCreate_dateTime desc
  `;
    const adhocTasksResult = await pool.request().query(adhocTasksSql);
    // Combine data
    for (const shift of shifts) {
        shift.crews = crewsResult.recordset.filter((crew) => crew.shiftId === shift.shiftId);
        shift.employees = employeesResult.recordset.filter((employee) => employee.shiftId === shift.shiftId);
        shift.equipment = equipmentResult.recordset.filter((equipment) => equipment.shiftId === shift.shiftId);
        shift.workOrders = workOrdersResult.recordset.filter((workOrder) => workOrder.shiftId === shift.shiftId);
        shift.adhocTasks = adhocTasksResult.recordset.filter((adhocTask) => adhocTask.shiftId === shift.shiftId);
    }
    return shifts;
}
