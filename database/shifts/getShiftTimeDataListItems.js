import getDataListItems from '../app/getDataListItems.js';
export default async function getShiftTimeDataListItems(userName) {
    return await getDataListItems('shiftTimes', userName);
}
