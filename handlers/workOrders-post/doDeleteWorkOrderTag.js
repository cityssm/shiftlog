import deleteWorkOrderTag from '../../database/workOrders/deleteWorkOrderTag.js';
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderTag(request.body.workOrderId, request.body.tagName);
    if (success) {
        const tags = await getWorkOrderTags(request.body.workOrderId);
        response.json({
            success: true,
            tags
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: `Failed to remove tag from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        });
    }
}
