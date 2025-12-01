import reopenWorkOrder from '../../database/workOrders/reopenWorkOrder.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`;
export default async function handler(request, response) {
    const success = await reopenWorkOrder(request.body.workOrderId, request.session.user?.userName ?? '');
    if (success) {
        response.json({
            success: true,
            message: 'Work order reopened successfully.',
            redirectUrl: `${redirectRoot}/${request.body.workOrderId}`
        });
    }
    else {
        response.json({
            success: false,
            errorMessage: 'Failed to reopen work order.'
        });
    }
}
