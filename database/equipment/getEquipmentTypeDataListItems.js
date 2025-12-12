import getDataListItems from '../app/getDataListItems.js';
export default async function getEquipmentTypeDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getDataListItems('equipmentTypes', userName);
}
