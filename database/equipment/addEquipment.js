import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
// eslint-disable-next-line @typescript-eslint/max-params
export default async function addEquipment(equipmentNumber, equipmentName, equipmentDescription, equipmentTypeDataListItemId, employeeListId, userGroupId, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('equipmentNumber', equipmentNumber)
            .input('equipmentName', equipmentName)
            .input('equipmentDescription', equipmentDescription)
            .input('equipmentTypeDataListItemId', equipmentTypeDataListItemId)
            .input('employeeListId', employeeListId ?? undefined)
            .input('userGroupId', userGroupId ?? undefined)
            .input('recordCreate_userName', user.userName)
            .input('recordCreate_dateTime', currentDate)
            .input('recordUpdate_userName', user.userName)
            .input('recordUpdate_dateTime', currentDate)
            .query(/* sql */ `
        INSERT INTO
          ShiftLog.Equipment (
            instance,
            equipmentNumber,
            equipmentName,
            equipmentDescription,
            equipmentTypeDataListItemId,
            employeeListId,
            userGroupId,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @instance,
            @equipmentNumber,
            @equipmentName,
            @equipmentDescription,
            @equipmentTypeDataListItemId,
            @employeeListId,
            @userGroupId,
            @recordCreate_userName,
            @recordCreate_dateTime,
            @recordUpdate_userName,
            @recordUpdate_dateTime
          )
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
