import getUserGroups from '../../database/users/getUserGroups.js';
import updateUserGroup from '../../database/users/updateUserGroup.js';
export default async function handler(request, response) {
    const success = await updateUserGroup(Number.parseInt(request.body.userGroupId, 10), request.body.userGroupName, request.session.user);
    const userGroups = await getUserGroups();
    response.json({
        success,
        userGroups
    });
}
