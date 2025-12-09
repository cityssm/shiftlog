import getWorkOrderTags from '../../database/workOrderTags/getWorkOrderTags.js';
export default async function handler(request, response) {
    const tags = await getWorkOrderTags(Number(request.params.workOrderId));
    response.json({
        success: true,
        tags
    });
}
