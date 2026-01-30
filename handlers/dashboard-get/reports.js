import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
export default async function handler(request, response) {
    const activeTab = request.query.tab ?? '';
    const assignedToDataListItems = await getAssignedToList(request.session.user?.userName);
    response.render('dashboard/reports', {
        headTitle: 'Reports and Exports',
        section: 'timesheets',
        activeTab,
        assignedToDataListItems
    });
}
