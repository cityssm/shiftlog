import getDataListItems from '../app/getDataListItems.js';
export default async function getAssignedToDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getDataListItems('assignedTo', userName);
}
