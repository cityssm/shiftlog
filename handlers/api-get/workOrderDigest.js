import { getUserByApiKey } from '../../database/users/getUser.js';
import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
import { getWorkOrdersForDigest } from '../../database/workOrders/getWorkOrdersForDigest.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    // Authenticate API user
    const apiUser = await getUserByApiKey(request.params.apiKey);
    if (apiUser === undefined) {
        response.status(401).json({ error: 'Invalid API key' });
        return;
    }
    // Validate required parameter
    if (!request.query.assignedToDataListItemId) {
        response
            .status(400)
            .json({ error: 'Missing required parameter: assignedToDataListItemId' });
        return;
    }
    // Get assigned to data list item
    const assignedToDataListItemId = Number(request.query.assignedToDataListItemId);
    const assignedToDataListItems = await getAssignedToDataListItems(apiUser.userName);
    const assignedToDataListItem = assignedToDataListItems.find((item) => item.dataListItemId === assignedToDataListItemId);
    // Get digest data
    const digestData = await getWorkOrdersForDigest(request.query.assignedToDataListItemId);
    // Generate report date/time
    const reportDateTime = new Date();
    // Render the print view
    response.render('print/workOrderDigest', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} Digest`,
        reportDateTime,
        milestones: digestData.milestones,
        workOrders: digestData.workOrders,
        assignedToDataListItem
    });
}
