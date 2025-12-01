import getDeletedWorkOrders from '../../database/workOrders/getDeletedWorkOrders.js';
export default async function handler(request, response) {
    const { workOrders, totalCount } = await getDeletedWorkOrders({
        limit: request.body.limit,
        offset: request.body.offset
    }, request.session.user);
    response.json({
        success: true,
        workOrders,
        totalCount
    });
}
