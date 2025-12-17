import getDataListItems from '../app/getDataListItems.js';
export default async function getWorkOrderPriorityDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getDataListItems('workOrderPriorities', userName);
}
