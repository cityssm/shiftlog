import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { notificationQueueTypes, notificationTypes } from '../../tasks/notifications/types.js';
export default async function handler(_request, response) {
    const notificationConfigurations = await getNotificationConfigurations();
    const assignedToList = await getAssignedToList();
    const configuredProtocols = getConfigProperty('notifications.protocols');
    const filteredNotificationTypes = configuredProtocols.length > 0
        ? notificationTypes.filter((type) => configuredProtocols.includes(type))
        : [];
    response.render('admin/notificationConfigurations', {
        headTitle: 'Notification Configuration',
        section: 'admin',
        notificationConfigurations,
        assignedToList,
        notificationQueueTypes,
        notificationTypes: filteredNotificationTypes
    });
}
