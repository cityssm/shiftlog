import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js';
import { notificationQueueTypes, notificationTypes } from '../../tasks/notifications/types.js';
export default async function handler(_request, response) {
    const notificationConfigurations = await getNotificationConfigurations();
    const assignedToList = await getAssignedToList();
    response.render('admin/notificationConfigurations', {
        headTitle: 'Notification Configuration',
        notificationConfigurations,
        assignedToList,
        notificationQueueTypes,
        notificationTypes
    });
}
