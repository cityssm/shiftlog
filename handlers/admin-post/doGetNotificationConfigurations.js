import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js';
export default async function handler(_request, response) {
    const notificationConfigurations = await getNotificationConfigurations();
    response.json({
        success: true,
        notificationConfigurations
    });
}
