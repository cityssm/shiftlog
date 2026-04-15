import getAssignedToItem from '../../database/assignedTo/getAssignedToItem.js';
import { getUserByApiKey } from '../../database/users/getUser.js';
import { getWorkOrdersForDigest } from '../../database/workOrders/getWorkOrdersForDigest.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const apiUser = await getUserByApiKey(request.params.apiKey);
    if (apiUser === undefined) {
        response.status(401).json({ error: 'Invalid API key' });
        return;
    }
    if (!request.query.assignedToId) {
        response
            .status(400)
            .json({ error: 'Missing required parameter: assignedToId' });
        return;
    }
    const assignedToId = Number(request.query.assignedToId);
    const assignedToItem = await getAssignedToItem(assignedToId);
    const digestData = await getWorkOrdersForDigest(request.query.assignedToId);
    const reportDateTime = new Date();
    response.render('print/workOrderDigest', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} Digest`,
        reportDateTime,
        milestones: digestData.milestones,
        workOrders: digestData.workOrders,
        assignedToItem
    });
}
