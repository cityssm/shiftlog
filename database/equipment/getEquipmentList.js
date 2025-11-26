import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getEquipmentList(filters = {}) {
    const pool = await getShiftLogConnectionPool();
    const result = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('equipmentNumber', filters.equipmentNumber)
        .query(/* sql */ `
      select e.equipmentNumber, e.equipmentName, e.equipmentDescription,
        e.equipmentTypeDataListItemId, dli.dataListItem as equipmentTypeDataListItem,
        e.userGroupId,
        ug.userGroupName,
        recordSync_isSynced, recordSync_source, recordSync_dateTime,
        e.recordCreate_userName, e.recordCreate_dateTime,
        e.recordUpdate_userName, e.recordUpdate_dateTime
      from ShiftLog.Equipment e
      left join ShiftLog.DataListItems dli on
        e.equipmentTypeDataListItemId = dli.dataListItemId
      left join ShiftLog.UserGroups ug on e.userGroupId = ug.userGroupId
      where
        e.instance = @instance
        ${(filters.includeDeleted ?? false) ? '' : 'and e.recordDelete_dateTime is null'}
        ${filters.equipmentNumber === undefined ? '' : 'and e.equipmentNumber = @equipmentNumber'}
      order by e.equipmentNumber, e.equipmentName
    `);
    return result.recordset;
}
