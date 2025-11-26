import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
export default async function handler(request, response) {
    const assignedToDataListItems = await getAssignedToDataListItems(request.session.user);
    response.render('dashboard/userSettings', {
        headTitle: 'User Settings',
        assignedToDataListItems
    });
}
