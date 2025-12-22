import getDataListItems from '../app/getDataListItems.js';
export default async function getAdhocTaskTypeDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getDataListItems('adhocTaskTypes', userName);
}
