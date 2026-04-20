import deleteWorkOrderSubscriber from '../../database/workOrders/deleteWorkOrderSubscriber.js';
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderSubscriber(request.body.workOrderId, request.body.subscriberSequence, request.session.user?.userName ?? '');
    if (success) {
        const subscribers = await getWorkOrderSubscribers(request.body.workOrderId);
        response.json({
            success: true,
            subscribers
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: `Failed to remove subscriber from ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        });
    }
}
