import getDeletedWorkOrders from '../../database/workOrders/getDeletedWorkOrders.js';
export default async function handler(request, response) {
    const workOrders = await getDeletedWorkOrders(request.session.user);
    response.json({
        success: true,
        workOrders
    });
}
