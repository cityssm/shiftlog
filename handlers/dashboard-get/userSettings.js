import getUserScheduledReports from '../../database/users/getUserScheduledReports.js';
import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
export default async function handler(request, response) {
    const assignedToDataListItems = await getAssignedToDataListItems(request.session.user);
    const scheduledReports = await getUserScheduledReports(request.session.user?.userName ?? '');
    response.render('dashboard/userSettings', {
        headTitle: 'User Settings',
        assignedToDataListItems,
        scheduledReports
    });
}
