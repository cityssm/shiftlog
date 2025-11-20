import getDataListItems from '../app/getDataListItems.js';
export default async function getWorkOrderTypeDataListItems(user) {
    return await getDataListItems('workOrderTypes', user);
}
