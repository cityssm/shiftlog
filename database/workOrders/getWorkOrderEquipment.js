import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getWorkOrderEquipment(workOrderId, user) {
    const pool = await getShiftLogConnectionPool();
    const instance = getConfigProperty('application.instance');
    const workOrderEquipmentResult = await pool
        .request()
        .input('instance', instance)
        .input('userName', user?.userName)
        .input('workOrderId', workOrderId)
        .query(`
      SELECT
        woe.workOrderId,
        woe.equipmentNumber,
        woe.workOrderEquipmentNote,
        woe.recordCreate_userName,
        woe.recordCreate_dateTime,
        woe.recordUpdate_userName,
        woe.recordUpdate_dateTime,
        eq.equipmentName,
        eq.equipmentDescription,
        eqType.dataListItem AS equipmentTypeDataListItem,
        eqType.colorHex AS equipmentTypeColorHex,
        eqType.iconClass AS equipmentTypeIconClass,
        eq.userGroupId
      FROM
        ShiftLog.WorkOrderEquipment woe
        INNER JOIN ShiftLog.WorkOrders wo ON woe.workOrderId = wo.workOrderId
        INNER JOIN ShiftLog.Equipment eq ON woe.instance = eq.instance
        AND woe.equipmentNumber = eq.equipmentNumber
        LEFT JOIN ShiftLog.DataListItems eqType ON eq.equipmentTypeDataListItemId = eqType.dataListItemId
      WHERE
        woe.workOrderId = @workOrderId
        AND wo.recordDelete_dateTime IS NULL
        AND wo.instance = @instance
        AND woe.recordDelete_dateTime IS NULL
        AND eq.recordDelete_dateTime IS NULL ${user === undefined
        ? ''
        : `
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
            `}
      ORDER BY
        eq.equipmentName,
        eq.equipmentNumber
    `);
    const availableEquipmentResult = await pool
        .request()
        .input('instance', instance)
        .input('userName', user?.userName)
        .input('workOrderId', workOrderId)
        .query(`
      SELECT
        eq.equipmentNumber,
        eq.equipmentName
      FROM
        ShiftLog.Equipment eq
      WHERE
        eq.instance = @instance
        AND eq.recordDelete_dateTime IS NULL
        AND eq.equipmentNumber NOT IN (
          SELECT
            woe.equipmentNumber
          FROM
            ShiftLog.WorkOrderEquipment woe
          WHERE
            woe.workOrderId = @workOrderId
            AND woe.recordDelete_dateTime IS NULL
        ) ${user === undefined
        ? ''
        : `
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
            `}
      ORDER BY
        eq.equipmentName,
        eq.equipmentNumber
    `);
    return {
        availableEquipment: availableEquipmentResult.recordset,
        workOrderEquipment: workOrderEquipmentResult.recordset
    };
}
