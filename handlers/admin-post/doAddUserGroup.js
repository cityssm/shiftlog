import addUserGroup from '../../database/users/addUserGroup.js';
import getUserGroups from '../../database/users/getUserGroups.js';
export default async function handler(request, response) {
    const userGroupId = await addUserGroup(request.body.userGroupName, request.session.user);
    const userGroups = await getUserGroups();
    response.json({
        success: userGroupId !== undefined,
        userGroupId,
        userGroups
    });
}
