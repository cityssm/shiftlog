import toggleNotificationConfigurationIsActive from '../../database/notifications/toggleNotificationConfigurationIsActive.js';
export default async function handler(request, response) {
    try {
        const success = await toggleNotificationConfigurationIsActive(Number.parseInt(request.body.notificationConfigurationId, 10), request.session.user?.userName ?? '');
        response.json({
            success
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
