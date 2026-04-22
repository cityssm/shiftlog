import addWorkOrderSubscriber from '../../database/workOrders/addWorkOrderSubscriber.js';
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const success = await addWorkOrderSubscriber(request.body.workOrderId, request.body.subscriberEmailAddress, request.session.user?.userName ?? '');
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
            errorMessage: `Failed to add subscriber to ${getConfigProperty('workOrders.sectionNameSingular').toLowerCase()}.`
        });
    }
}
