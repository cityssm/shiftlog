import getEquipmentList from './getEquipmentList.js';
export default async function getEquipment(equipmentNumber, includeDeleted = false) {
    const equipmentList = await getEquipmentList({
        equipmentNumber,
        includeDeleted
    });
    return equipmentList.length > 0 ? equipmentList[0] : undefined;
}
