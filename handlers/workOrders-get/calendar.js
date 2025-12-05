import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const assignedToItems = await getAssignedToDataListItems(request.session.user);
    response.render('workOrders/calendar', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} - Calendar`,
        error: request.query.error ?? '',
        assignedToItems
    });
}
