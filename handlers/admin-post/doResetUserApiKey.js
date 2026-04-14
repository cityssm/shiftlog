import getUsers from '../../database/users/getUsers.js';
import getUserSettings from '../../database/users/getUserSettings.js';
import { updateApiKeyUserSetting } from '../../database/users/updateUserSetting.js';
export default async function handler(request, response) {
    if (!request.body.userName?.trim()) {
        response.status(400).json({
            message: 'User name is required',
            success: false
        });
        return;
    }
    try {
        const newApiKey = await updateApiKeyUserSetting(request.body.userName);
        if (request.session.user?.userName === request.body.userName) {
            ;
            request.session.user.userSettings = await getUserSettings(request.body.userName);
        }
        const users = await getUsers();
        response.json({
            message: 'API key reset successfully',
            success: true,
            users,
            apiKey: newApiKey
        });
    }
    catch {
        response.status(500).json({
            message: 'Failed to reset API key',
            success: false
        });
    }
}
