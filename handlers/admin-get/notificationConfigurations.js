import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { notificationTypes } from '../../tasks/notifications/types.js';
const configuredProtocols = getConfigProperty('notifications.protocols');
const filteredNotificationTypes = configuredProtocols.length > 0
    ? notificationTypes.filter((type) => configuredProtocols.includes(type))
    : [];
const filteredNotificationQueueTypes = [
    'workOrder.create',
    'workOrder.update'
];
export default async function handler(_request, response) {
    const notificationConfigurations = await getNotificationConfigurations();
    const assignedToList = await getAssignedToList();
    response.render('admin/notificationConfigurations', {
        headTitle: 'Notification Configuration',
        section: 'admin',
        notificationConfigurations,
        assignedToList,
        notificationQueueTypes: filteredNotificationQueueTypes,
        notificationTypes: filteredNotificationTypes
    });
}
