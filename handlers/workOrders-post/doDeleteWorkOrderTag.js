import deleteWorkOrderTag from '../../database/workOrderTags/deleteWorkOrderTag.js';
import getWorkOrderTags from '../../database/workOrderTags/getWorkOrderTags.js';
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
            message: 'Tag could not be removed from work order.'
        });
    }
}
