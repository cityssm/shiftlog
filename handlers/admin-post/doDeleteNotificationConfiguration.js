import deleteNotificationConfiguration from '../../database/notifications/deleteNotificationConfiguration.js';
export default async function handler(request, response) {
    try {
        const success = await deleteNotificationConfiguration(Number.parseInt(request.body.notificationConfigurationId, 10), request.session.user?.userName ?? '');
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
