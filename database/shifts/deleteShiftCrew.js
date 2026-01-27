import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function deleteShiftCrew(form) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    try {
        await pool
            .request()
            .input('shiftId', form.shiftId)
            .input('crewId', form.crewId)
            .query(/* sql */ `
        DELETE FROM ShiftLog.ShiftCrews
        WHERE
          shiftId = @shiftId
          AND crewId = @crewId
      `);
        return true;
    }
    catch {
        return false;
    }
}
