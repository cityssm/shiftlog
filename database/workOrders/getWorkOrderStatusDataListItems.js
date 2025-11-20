import getDataListItems from '../app/getDataListItems.js';
export default async function getWorkOrderStatusDataListItems(user) {
    return await getDataListItems('workOrderStatuses', user);
}
