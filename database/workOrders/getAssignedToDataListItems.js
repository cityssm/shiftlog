import getAssignedToList from '../assignedTo/getAssignedToList.js';
export default async function getAssignedToDataListItems(user) {
    const userName = typeof user === 'string' ? user : user?.userName;
    return await getAssignedToList(userName);
}
