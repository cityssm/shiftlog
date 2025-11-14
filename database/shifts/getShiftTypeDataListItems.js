import getDataListItems from '../app/getDataListItems.js';
export default async function getShiftTypeDataListItems(user) {
    return await getDataListItems('shiftTypes', user);
}
