import createNotificationConfiguration from '../../database/notifications/createNotificationConfiguration.js';
export default async function handler(request, response) {
    try {
        const notificationConfigurationId = await createNotificationConfiguration(request.body, request.session.user?.userName ?? '');
        response.json({
            success: true,
            notificationConfigurationId
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
