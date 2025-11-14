import getDataListItems from '../app/getDataListItems.js';
export default async function getShiftTimeDataListItems(user) {
    return await getDataListItems('shiftTimes', user);
}
