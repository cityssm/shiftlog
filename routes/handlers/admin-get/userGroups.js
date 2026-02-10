import getUserGroups from '../../database/users/getUserGroups.js';
import getUsers from '../../database/users/getUsers.js';
export default async function handler(_request, response) {
    const userGroups = await getUserGroups();
    const users = await getUsers();
    response.render('admin/userGroups', {
        headTitle: 'User Group Management',
        section: 'admin',
        userGroups,
        users
    });
}
