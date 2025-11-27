import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const assignedToItems = await getAssignedToDataListItems(request.session.user);
    const workOrderTypes = await getWorkOrderTypes(request.session.user);
    response.render('workOrders/map', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} - Map`,
        assignedToItems,
        workOrderTypes
    });
}
