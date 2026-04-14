import getUsers from '../../database/users/getUsers.js';
import getUserSettings from '../../database/users/getUserSettings.js';
import updateUserSetting from '../../database/users/updateUserSetting.js';
import { userSettingKeys } from '../../types/user.types.js';
export default async function handler(request, response) {
    if (request.body.userName === '') {
        response.status(400).json({
            message: 'User name is required',
            success: false
        });
        return;
    }
    for (const settingKey of userSettingKeys) {
        if (settingKey === 'apiKey') {
            continue;
        }
        const settingValue = request.body[settingKey];
        if (settingValue !== undefined) {
            await updateUserSetting(request.body.userName, settingKey, settingValue);
        }
    }
    if (request.session.user?.userName === request.body.userName) {
        ;
        request.session.user.userSettings = await getUserSettings(request.body.userName);
    }
    const users = await getUsers();
    response.json({
        message: 'User settings updated successfully',
        success: true,
        users
    });
}
