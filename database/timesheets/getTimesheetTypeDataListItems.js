import getDataListItems from '../app/getDataListItems.js';
export default async function getTimesheetTypeDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getDataListItems('timesheetTypes', userName);
}
