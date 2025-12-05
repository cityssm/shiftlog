import getWorkOrdersForPlanner from '../../database/workOrders/getWorkOrdersForPlanner.js';
export default async function handler(request, response) {
    const workOrdersResults = await getWorkOrdersForPlanner(request.body, request.body, request.session.user);
    response.json({
        success: true,
        workOrders: workOrdersResults.workOrders,
        totalCount: workOrdersResults.totalCount,
        limit: typeof request.body.limit === 'number'
            ? request.body.limit
            : Number.parseInt(request.body.limit, 10),
        offset: typeof request.body.offset === 'number'
            ? request.body.offset
            : Number.parseInt(request.body.offset, 10)
    });
}
