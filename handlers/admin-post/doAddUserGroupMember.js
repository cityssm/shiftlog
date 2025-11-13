import addUserGroupMember from '../../database/userGroups/addUserGroupMember.js';
import getUserGroup from '../../database/userGroups/getUserGroup.js';
export default async function handler(request, response) {
    const userGroupId = Number.parseInt(request.body.userGroupId, 10);
    const success = await addUserGroupMember(userGroupId, request.body.userName);
    const userGroup = await getUserGroup(userGroupId);
    response.json({
        success,
        userGroup
    });
}
