import updateNotificationConfiguration from '../../database/notifications/updateNotificationConfiguration.js';
export default async function handler(request, response) {
    try {
        const success = await updateNotificationConfiguration(request.body, request.session.user?.userName ?? '');
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
