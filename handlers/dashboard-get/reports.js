import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
export default async function handler(request, response) {
    const activeTab = request.query.tab ?? '';
    const assignedToDataListItems = await getAssignedToDataListItems();
    response.render('dashboard/reports', {
        headTitle: 'Reports and Exports',
        activeTab,
        assignedToDataListItems
    });
}
