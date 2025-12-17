import getDataListItems from '../app/getDataListItems.js';
export default async function getShiftTypeDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getDataListItems('shiftTypes', userName);
}
