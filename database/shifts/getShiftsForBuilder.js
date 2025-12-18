// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default function getShiftsForBuilder(shiftDateString, user) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const pool = yield getShiftLogConnectionPool();
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
        const shiftsResult = yield pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('shiftDateString', shiftDateString)
            .input('userName', user === null || user === void 0 ? void 0 : user.userName)
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
        const crewsResult = yield pool.request().query(crewsSql);
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
        const employeesResult = yield pool.request().query(employeesSql);
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
        const equipmentResult = yield pool.request().query(equipmentSql);
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
        const workOrdersResult = yield pool.request().query(workOrdersSql);
        // Combine data
        for (const shift of shifts) {
            shift.crews =
                (_a = crewsResult.recordset.filter((c) => c.shiftId === shift.shiftId)) !== null && _a !== void 0 ? _a : [];
            shift.employees =
                (_b = employeesResult.recordset.filter((e) => e.shiftId === shift.shiftId)) !== null && _b !== void 0 ? _b : [];
            shift.equipment =
                (_c = equipmentResult.recordset.filter((eq) => eq.shiftId === shift.shiftId)) !== null && _c !== void 0 ? _c : [];
            shift.workOrders =
                (_d = workOrdersResult.recordset.filter((w) => w.shiftId === shift.shiftId)) !== null && _d !== void 0 ? _d : [];
        }
        return shifts;
    });
}
