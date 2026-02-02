import getSuggestedTags from '../../database/workOrders/getSuggestedTags.js';
const suggestedTagsLimit = 10;
export default async function handler(request, response) {
    const suggestedTags = await getSuggestedTags(Number(request.params.workOrderId), suggestedTagsLimit);
    response.json({
        success: true,
        suggestedTags
    });
}
