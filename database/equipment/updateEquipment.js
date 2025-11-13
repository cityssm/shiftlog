import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateEquipment(equipmentNumber, equipmentName, equipmentDescription, equipmentTypeDataListItemId, userGroupId, user) {
    const currentDate = new Date();
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        const result = await pool
            .request()
            .input('equipmentNumber', equipmentNumber)
            .input('equipmentName', equipmentName)
            .input('equipmentDescription', equipmentDescription)
            .input('equipmentTypeDataListItemId', equipmentTypeDataListItemId)
            .input('userGroupId', userGroupId ?? null)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        update ShiftLog.Equipment
        set equipmentName = @equipmentName,
          equipmentDescription = @equipmentDescription,
          equipmentTypeDataListItemId = @equipmentTypeDataListItemId,
          userGroupId = @userGroupId,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        where equipmentNumber = @equipmentNumber
          and recordDelete_dateTime is null
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
