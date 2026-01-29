import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function addEquipment(addEquipmentForm, user) {
    const currentDate = new Date();
    try {
        const pool = await getShiftLogConnectionPool();
        const result = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('equipmentNumber', addEquipmentForm.equipmentNumber)
            .input('equipmentName', addEquipmentForm.equipmentName)
            .input('equipmentDescription', addEquipmentForm.equipmentDescription)
            .input('equipmentTypeDataListItemId', addEquipmentForm.equipmentTypeDataListItemId)
            .input('employeeListId', addEquipmentForm.employeeListId ?? undefined)
            .input('userGroupId', addEquipmentForm.userGroupId ?? undefined)
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
