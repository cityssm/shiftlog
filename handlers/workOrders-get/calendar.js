import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const assignedToItems = await getAssignedToList(request.session.user?.userName);
    response.render('workOrders/calendar', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} - Calendar`,
        section: 'workOrders',
        error: request.query.error ?? '',
        assignedToItems
    });
}
