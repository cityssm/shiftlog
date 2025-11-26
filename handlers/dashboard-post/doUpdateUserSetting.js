// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */
import getUserSettings from '../../database/users/getUserSettings.js';
import updateUserSetting from '../../database/users/updateUserSetting.js';
const updatableUserSettingKeys = [
    'workOrders.defaultAssignedToDataListItemId'
];
export default async function handler(request, response) {
    const success = updatableUserSettingKeys.includes(request.body.settingKey)
        ? await updateUserSetting(request.session.user?.userName ?? '', request.body.settingKey, request.body.settingValue)
        : false;
    request.session.user.userSettings = await getUserSettings(request.session.user?.userName ?? '');
    response.json({
        success
    });
}
