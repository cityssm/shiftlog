import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import getEmployee from '../../database/employees/getEmployee.js';
import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const assignedToDataListItems = await getAssignedToList(request.session.user?.userName);
    // Get employee information if available and userName matches
    let employee = request.session.user?.employeeNumber
        ? await getEmployee(request.session.user.employeeNumber)
        : undefined;
    // Verify that the employee's userName matches the current user's userName
    if (employee !== undefined &&
        employee.userName !== request.session.user?.userName) {
        employee = undefined;
    }
    let ntfyNotificationConfigurations = [];
    if (getConfigProperty('notifications.protocols').includes('ntfy')) {
        const notificationConfigurations = await getNotificationConfigurations();
        const assignedToItems = await getAssignedToList(request.session.user?.userName);
        ntfyNotificationConfigurations = notificationConfigurations.filter((config) => (config.isActive &&
            config.notificationType === 'ntfy' &&
            (config.assignedToId === null ||
                assignedToItems.some((item) => item.assignedToId === config.assignedToId))));
    }
    response.render('dashboard/userSettings', {
        headTitle: 'User Settings',
        section: 'dashboard',
        assignedToDataListItems,
        employee,
        ntfyNotificationConfigurations
    });
}
