import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function copyFromPreviousShift(form, user) {
    const pool = await getShiftLogConnectionPool();
    try {
        // Copy crews
        if (form.copyCrews) {
            await pool
                .request()
                .input('currentShiftId', form.currentShiftId)
                .input('previousShiftId', form.previousShiftId)
                .input('userName', user.userName)
                .query(/* sql */ `
          INSERT INTO
            ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)
          SELECT
            @currentShiftId,
            sc.crewId,
            sc.shiftCrewNote
          FROM
            ShiftLog.ShiftCrews sc
            INNER JOIN ShiftLog.Crews c ON sc.crewId = c.crewId
          WHERE
            sc.shiftId = @previousShiftId
            AND c.recordDelete_dateTime IS NULL
            AND (
              c.userGroupId IS NULL
              OR c.userGroupId IN (
                SELECT
                  userGroupId
                FROM
                  ShiftLog.UserGroupMembers
                WHERE
                  userName = @userName
              )
            )
            AND NOT EXISTS (
              SELECT
                1
              FROM
                ShiftLog.ShiftCrews sc2
              WHERE
                sc2.shiftId = @currentShiftId
                AND sc2.crewId = sc.crewId
            )
        `);
        }
        // Copy employees
        if (form.copyEmployees) {
            await pool
                .request()
                .input('currentShiftId', form.currentShiftId)
                .input('previousShiftId', form.previousShiftId)
                .input('userName', user.userName)
                .query(/* sql */ `
          INSERT INTO
            ShiftLog.ShiftEmployees (
              shiftId,
              instance,
              employeeNumber,
              crewId,
              shiftEmployeeNote
            )
          SELECT
            @currentShiftId,
            se.instance,
            se.employeeNumber,
            se.crewId,
            se.shiftEmployeeNote
          FROM
            ShiftLog.ShiftEmployees se
            INNER JOIN ShiftLog.Employees e ON se.instance = e.instance
            AND se.employeeNumber = e.employeeNumber
          WHERE
            se.shiftId = @previousShiftId
            AND e.recordDelete_dateTime IS NULL
            AND (
              e.userGroupId IS NULL
              OR e.userGroupId IN (
                SELECT
                  userGroupId
                FROM
                  ShiftLog.UserGroupMembers
                WHERE
                  userName = @userName
              )
            )
            AND NOT EXISTS (
              SELECT
                1
              FROM
                ShiftLog.ShiftEmployees se2
              WHERE
                se2.shiftId = @currentShiftId
                AND se2.employeeNumber = se.employeeNumber
            )
        `);
        }
        // Copy equipment
        if (form.copyEquipment) {
            await pool
                .request()
                .input('currentShiftId', form.currentShiftId)
                .input('previousShiftId', form.previousShiftId)
                .input('userName', user.userName)
                .query(/* sql */ `
          INSERT INTO
            ShiftLog.ShiftEquipment (
              shiftId,
              instance,
              equipmentNumber,
              employeeNumber,
              shiftEquipmentNote
            )
          SELECT
            @currentShiftId,
            se.instance,
            se.equipmentNumber,
            se.employeeNumber,
            se.shiftEquipmentNote
          FROM
            ShiftLog.ShiftEquipment se
            INNER JOIN ShiftLog.Equipment eq ON se.instance = eq.instance
            AND se.equipmentNumber = eq.equipmentNumber
          WHERE
            se.shiftId = @previousShiftId
            AND eq.recordDelete_dateTime IS NULL
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
            AND NOT EXISTS (
              SELECT
                1
              FROM
                ShiftLog.ShiftEquipment se2
              WHERE
                se2.shiftId = @currentShiftId
                AND se2.equipmentNumber = se.equipmentNumber
            )
            AND (
              -- Validate employee is allowed for equipment with employee list
              se.employeeNumber IS NULL
              OR eq.employeeListId IS NULL
              OR EXISTS (
                SELECT
                  1
                FROM
                  ShiftLog.EmployeeListMembers elm
                WHERE
                  elm.employeeListId = eq.employeeListId
                  AND elm.employeeNumber = se.employeeNumber
              )
            )
        `);
        }
        return true;
    }
    catch {
        return false;
    }
}
