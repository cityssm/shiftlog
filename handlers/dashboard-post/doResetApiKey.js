import getUserSettings from '../../database/users/getUserSettings.js';
import { updateApiKeyUserSetting } from '../../database/users/updateUserSetting.js';
export default async function handler(request, response) {
    const apiKey = await updateApiKeyUserSetting(request.session.user?.userName ?? '');
    request.session.user.userSettings = await getUserSettings(request.session.user?.userName ?? '');
    response.json({
        success: true,
        apiKey
    });
}
