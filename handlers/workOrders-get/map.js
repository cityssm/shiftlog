import getAssignedToList from '../../database/assignedTo/getAssignedToList.js';
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const assignedToItems = await getAssignedToList(request.session.user?.userName);
    const workOrderTypes = await getWorkOrderTypes(request.session.user);
    response.render('workOrders/map', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} - Map`,
        assignedToItems,
        workOrderTypes
    });
}
