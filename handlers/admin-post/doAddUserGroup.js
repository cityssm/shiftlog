import addUserGroup from '../../database/userGroups/addUserGroup.js';
import getUserGroups from '../../database/userGroups/getUserGroups.js';
export default async function handler(request, response) {
    const userGroupId = await addUserGroup(request.body.userGroupName, request.session.user);
    const userGroups = await getUserGroups();
    response.json({
        success: userGroupId !== undefined,
        userGroupId,
        userGroups
    });
}
