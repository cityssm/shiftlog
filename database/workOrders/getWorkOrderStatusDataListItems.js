import getDataListItems from '../app/getDataListItems.js';
export default async function getWorkOrderStatusDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getDataListItems('workOrderStatuses', userName);
}
