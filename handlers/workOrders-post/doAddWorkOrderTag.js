import addWorkOrderTag from '../../database/workOrders/addWorkOrderTag.js';
import getWorkOrderTags from '../../database/workOrders/getWorkOrderTags.js';
export default async function handler(request, response) {
    const success = await addWorkOrderTag(request.body.workOrderId, request.body.tagName);
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
            message: 'Tag could not be added to work order.'
        });
    }
}
