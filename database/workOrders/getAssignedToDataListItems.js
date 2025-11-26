import getDataListItems from '../app/getDataListItems.js';
export default async function getAssignedToDataListItems(user) {
    return await getDataListItems('assignedTo', user);
}
