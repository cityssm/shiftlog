import getDataListItems from '../app/getDataListItems.js';
export default async function getTimesheetTypeDataListItems(user) {
    return await getDataListItems('timesheetTypes', user);
}
