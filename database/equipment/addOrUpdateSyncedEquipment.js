import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
import { usePartialOrCurrentValue } from '../../helpers/sync.helpers.js';
import getOrAddDataListItemId from '../app/getOrAddDataListItemId.js';
import getEquipment from './getEquipment.js';
const debug = Debug(`${DEBUG_NAMESPACE}:database:equipment:addOrUpdateSyncedEquipment`);
async function addSyncedEquipment(partialEquipment, syncUserName) {
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('equipmentNumber', partialEquipment.equipmentNumber)
        .input('equipmentName', partialEquipment.equipmentName ?? '')
        .input('equipmentDescription', partialEquipment.equipmentDescription ?? '')
        .input('equipmentTypeDataListItemId', partialEquipment.equipmentTypeDataListItemId ?? undefined)
        .input('userGroupId', partialEquipment.userGroupId ?? undefined)
        .input('recordSync_isSynced', true)
        .input('recordSync_source', partialEquipment.recordSync_source ?? undefined)
        .input('recordSync_dateTime', partialEquipment.recordSync_dateTime ?? new Date())
        .input('recordCreate_userName', syncUserName)
        .input('recordCreate_dateTime', new Date())
        .input('recordUpdate_userName', syncUserName)
        .input('recordUpdate_dateTime', new Date())
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.Equipment (
          instance,
          equipmentNumber,
          equipmentName,
          equipmentDescription,
          equipmentTypeDataListItemId,
          userGroupId,
          recordSync_isSynced,
          recordSync_source,
          recordSync_dateTime,
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
          @userGroupId,
          @recordSync_isSynced,
          @recordSync_source,
          @recordSync_dateTime,
          @recordCreate_userName,
          @recordCreate_dateTime,
          @recordUpdate_userName,
          @recordUpdate_dateTime
        )
    `);
}
async function updateSyncedEquipment(currentEquipment, partialEquipment, syncUserName) {
    const updateEquipment = {
        equipmentNumber: currentEquipment.equipmentNumber,
        equipmentName: usePartialOrCurrentValue(partialEquipment.equipmentName, currentEquipment.equipmentName) ?? '',
        equipmentDescription: usePartialOrCurrentValue(partialEquipment.equipmentDescription, currentEquipment.equipmentDescription) ?? '',
        equipmentTypeDataListItemId: usePartialOrCurrentValue(partialEquipment.equipmentTypeDataListItemId, currentEquipment.equipmentTypeDataListItemId) ??
            (await getOrAddDataListItemId('equipmentTypes', 'Unknown', syncUserName)),
        userGroupId: usePartialOrCurrentValue(partialEquipment.userGroupId, currentEquipment.userGroupId),
        recordSync_isSynced: true,
        recordSync_source: partialEquipment.recordSync_source,
        recordSync_dateTime: partialEquipment.recordSync_dateTime ?? new Date()
    };
    const pool = await getShiftLogConnectionPool();
    await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('equipmentNumber', updateEquipment.equipmentNumber)
        .input('equipmentName', updateEquipment.equipmentName)
        .input('equipmentDescription', updateEquipment.equipmentDescription)
        .input('equipmentTypeDataListItemId', updateEquipment.equipmentTypeDataListItemId)
        .input('userGroupId', updateEquipment.userGroupId)
        .input('recordSync_isSynced', updateEquipment.recordSync_isSynced)
        .input('recordSync_source', updateEquipment.recordSync_source)
        .input('recordSync_dateTime', updateEquipment.recordSync_dateTime)
        .input('recordUpdate_userName', syncUserName)
        .input('recordUpdate_dateTime', new Date())
        .query(/* sql */ `
      UPDATE ShiftLog.Equipment
      SET
        equipmentName = @equipmentName,
        equipmentDescription = @equipmentDescription,
        equipmentTypeDataListItemId = @equipmentTypeDataListItemId,
        userGroupId = @userGroupId,
        recordSync_isSynced = @recordSync_isSynced,
        recordSync_source = @recordSync_source,
        recordSync_dateTime = @recordSync_dateTime,
        recordUpdate_userName = @recordUpdate_userName,
        recordUpdate_dateTime = @recordUpdate_dateTime,
        recordDelete_userName = NULL,
        recordDelete_dateTime = NULL
      WHERE
        instance = @instance
        AND equipmentNumber = @equipmentNumber
    `);
}
export default async function addOrUpdateSyncedEquipment(partialEquipment, syncUserName) {
    if (partialEquipment.equipmentTypeDataListItemId === undefined &&
        (partialEquipment.equipmentTypeDataListItem ?? '') !== '') {
        partialEquipment.equipmentTypeDataListItemId = await getOrAddDataListItemId('equipmentTypes', partialEquipment.equipmentTypeDataListItem ?? '', syncUserName);
    }
    const currentEquipment = await getEquipment(partialEquipment.equipmentNumber ?? '', true);
    try {
        if (currentEquipment === undefined) {
            debug('Adding new synced equipment', partialEquipment.equipmentNumber);
            await addSyncedEquipment(partialEquipment, syncUserName);
        }
        else if (currentEquipment.recordSync_isSynced) {
            debug('Updating synced equipment', partialEquipment.equipmentNumber);
            await updateSyncedEquipment(currentEquipment, partialEquipment, syncUserName);
        }
        else {
            debug('Skipping equipment not synced', partialEquipment.equipmentNumber);
            return false;
        }
    }
    catch (error) {
        debug(`Error adding or updating synced equipment ${partialEquipment.equipmentNumber}: `, error);
        return false;
    }
    return true;
}
