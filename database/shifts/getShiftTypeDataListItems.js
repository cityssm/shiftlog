import getDataListItems from '../app/getDataListItems.js';
export default async function getShiftTypeDataListItems(userName) {
    return await getDataListItems('shiftTypes', userName);
}
