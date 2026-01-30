import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(_request, response) {
    const assignedToList = await getAssignedToList();
    const userGroups = await getUserGroups();
    response.render('admin/assignedTo', {
        headTitle: 'Assigned To Management',
        section: 'admin',
        assignedToList,
        userGroups
    });
}
