import deleteUserGroup from '../../database/userGroups/deleteUserGroup.js';
import getUserGroups from '../../database/userGroups/getUserGroups.js';
export default async function handler(request, response) {
    const success = await deleteUserGroup(Number.parseInt(request.body.userGroupId, 10), request.session.user);
    const userGroups = await getUserGroups();
    response.json({
        success,
        userGroups
    });
}
