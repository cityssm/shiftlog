import doGetRequestorSuggestions from '../../database/workOrders/getRequestorSuggestions.js';
export default async function handler(request, response) {
    const requestors = await doGetRequestorSuggestions(request.body.searchString, request.session.user);
    response.json({
        success: true,
        requestors
    });
}
