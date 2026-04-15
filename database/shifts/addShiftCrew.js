import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addShiftCrew(form, user) {
    const pool = await getShiftLogConnectionPool();
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('crewId', form.crewId)
            .input('shiftCrewNote', form.shiftCrewNote ?? '')
            .query(`
        INSERT INTO
          ShiftLog.ShiftCrews (shiftId, crewId, shiftCrewNote)
        VALUES
          (@shiftId, @crewId, @shiftCrewNote)
      `);
        const crewMembersResult = await pool
            .request()
            .input('crewId', form.crewId)
            .query(`
        SELECT
          employeeNumber
        FROM
          ShiftLog.CrewMembers
        WHERE
          crewId = @crewId
      `);
        for (const member of crewMembersResult.recordset) {
            await pool
                .request()
                .input('shiftId', form.shiftId)
                .input('instance', getConfigProperty('application.instance'))
                .input('employeeNumber', member.employeeNumber)
                .input('crewId', form.crewId)
                .query(`
          IF NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEmployees
            WHERE
              shiftId = @shiftId
              AND employeeNumber = @employeeNumber
          ) BEGIN
          INSERT INTO
            ShiftLog.ShiftEmployees (
              shiftId,
              instance,
              employeeNumber,
              crewId,
              shiftEmployeeNote
            )
          VALUES
            (@shiftId, @instance, @employeeNumber, @crewId, '') END
        `);
        }
        const crewEquipmentResult = await pool
            .request()
            .input('crewId', form.crewId)
            .query(`
        SELECT
          equipmentNumber,
          employeeNumber
        FROM
          ShiftLog.CrewEquipment
        WHERE
          crewId = @crewId
      `);
        for (const equipment of crewEquipmentResult.recordset) {
            await pool
                .request()
                .input('shiftId', form.shiftId)
                .input('instance', getConfigProperty('application.instance'))
                .input('equipmentNumber', equipment.equipmentNumber)
                .input('employeeNumber', equipment.employeeNumber ?? null)
                .query(`
          IF NOT EXISTS (
            SELECT
              1
            FROM
              ShiftLog.ShiftEquipment
            WHERE
              shiftId = @shiftId
              AND equipmentNumber = @equipmentNumber
          ) BEGIN
          INSERT INTO
            ShiftLog.ShiftEquipment (
              shiftId,
              instance,
              equipmentNumber,
              employeeNumber,
              shiftEquipmentNote
            )
          VALUES
            (
              @shiftId,
              @instance,
              @equipmentNumber,
              @employeeNumber,
              ''
            ) END
        `);
        }
        return true;
    }
    catch {
        return false;
    }
}
