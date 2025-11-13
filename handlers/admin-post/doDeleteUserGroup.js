import deleteUserGroup from '../../database/users/deleteUserGroup.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(request, response) {
    const success = await deleteUserGroup(Number.parseInt(request.body.userGroupId, 10), request.session.user);
    const userGroups = await getUserGroups();
    response.json({
        success,
        userGroups
    });
}
