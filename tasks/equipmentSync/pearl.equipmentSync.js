import { WorkTechAPI } from '@cityssm/worktech-api';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function getEquipment() {
    const equipmentConfig = getConfigProperty('equipment');
    if (equipmentConfig.syncSource !== 'pearl') {
        return undefined;
    }
    const pearlConfig = getConfigProperty('connectors.pearl');
    if (pearlConfig === undefined) {
        return undefined;
    }
    const worktechApi = new WorkTechAPI(pearlConfig);
    const worktechEquipment = await worktechApi.getEquipment(equipmentConfig.filters ?? {});
    const equipmentList = [];
    for (const worktechEquipmentItem of worktechEquipment) {
        const equipmentItem = {
            equipmentNumber: worktechEquipmentItem.equipmentId,
            equipmentName: worktechEquipmentItem.equipmentDescription,
            equipmentDescription: `${worktechEquipmentItem.equipmentModelYear} ${worktechEquipmentItem.equipmentBrand} ${worktechEquipmentItem.equipmentModel}`,
            equipmentTypeDataListItem: worktechEquipmentItem.equipmentClass,
            recordSync_dateTime: new Date(),
            recordSync_isSynced: true,
            recordSync_source: 'pearl'
        };
        equipmentList.push(equipmentItem);
    }
    return equipmentList;
}
