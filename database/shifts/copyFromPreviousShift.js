import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function copyFromPreviousShift(form, user) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        // Copy crews
        if (form.copyCrews) {
            await pool
                .request()
                .input('currentShiftId', form.currentShiftId)
                .input('previousShiftId', form.previousShiftId)
                .input('userName', user.userName).query(/* sql */ `
          insert into ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)
          select @currentShiftId, sc.crewId, sc.shiftCrewNote
          from ShiftLog.ShiftCrews sc
          inner join ShiftLog.Crews c on sc.crewId = c.crewId
          where sc.shiftId = @previousShiftId
            and c.recordDelete_dateTime is null
            and (
              c.userGroupId is null or c.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
            and not exists (
              select 1 from ShiftLog.ShiftCrews sc2
              where sc2.shiftId = @currentShiftId and sc2.crewId = sc.crewId
            )
        `);
        }
        // Copy employees
        if (form.copyEmployees) {
            await pool
                .request()
                .input('currentShiftId', form.currentShiftId)
                .input('previousShiftId', form.previousShiftId)
                .input('userName', user.userName).query(/* sql */ `
          insert into ShiftLog.ShiftEmployees (shiftId, employeeNumber, crewId, shiftEmployeeNote)
          select @currentShiftId, se.employeeNumber, se.crewId, se.shiftEmployeeNote
          from ShiftLog.ShiftEmployees se
          inner join ShiftLog.Employees e on se.employeeNumber = e.employeeNumber
          where se.shiftId = @previousShiftId
            and e.recordDelete_dateTime is null
            and (
              e.userGroupId is null or e.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
            and not exists (
              select 1 from ShiftLog.ShiftEmployees se2
              where se2.shiftId = @currentShiftId and se2.employeeNumber = se.employeeNumber
            )
        `);
        }
        // Copy equipment
        if (form.copyEquipment) {
            await pool
                .request()
                .input('currentShiftId', form.currentShiftId)
                .input('previousShiftId', form.previousShiftId)
                .input('userName', user.userName).query(/* sql */ `
          insert into ShiftLog.ShiftEquipment (shiftId, equipmentNumber, employeeNumber, shiftEquipmentNote)
          select @currentShiftId, se.equipmentNumber, se.employeeNumber, se.shiftEquipmentNote
          from ShiftLog.ShiftEquipment se
          inner join ShiftLog.Equipment eq on se.equipmentNumber = eq.equipmentNumber
          where se.shiftId = @previousShiftId
            and eq.recordDelete_dateTime is null
            and (
              eq.userGroupId is null or eq.userGroupId in (
                select userGroupId
                from ShiftLog.UserGroupMembers
                where userName = @userName
              )
            )
            and not exists (
              select 1 from ShiftLog.ShiftEquipment se2
              where se2.shiftId = @currentShiftId and se2.equipmentNumber = se.equipmentNumber
            )
        `);
        }
        return true;
    }
    catch {
        return false;
    }
}
