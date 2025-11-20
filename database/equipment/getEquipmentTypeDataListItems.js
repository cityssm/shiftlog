import getDataListItems from '../app/getDataListItems.js';
export default async function getEquipmentTypeDataListItems(user) {
    return await getDataListItems('equipmentTypes', user);
}
