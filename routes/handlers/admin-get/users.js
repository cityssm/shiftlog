import getUsers from '../../database/users/getUsers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { userSettingKeys } from '../../types/user.types.js';
export default async function handler(_request, response) {
    const users = await getUsers();
    response.render('admin/users', {
        headTitle: 'User Management',
        section: 'admin',
        users,
        domain: getConfigProperty('login.domain'),
        userSettingKeys
    });
}
