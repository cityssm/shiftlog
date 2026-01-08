import getAssignedToDataListItems from '../../database/workOrders/getAssignedToDataListItems.js';
import getWorkOrder from '../../database/workOrders/getWorkOrder.js';
import getWorkOrderPriorityDataListItems from '../../database/workOrders/getWorkOrderPriorityDataListItems.js';
import getWorkOrderStatusDataListItems from '../../database/workOrders/getWorkOrderStatusDataListItems.js';
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import getWorkOrderThumbnailAttachment from '../../database/workOrders/getWorkOrderThumbnailAttachment.js';
const redirectRoot = `${getConfigProperty('reverseProxy.urlPrefix')}/${getConfigProperty('workOrders.router')}`;
export default async function handler(request, response) {
    const workOrder = await getWorkOrder(request.params.workOrderId, request.session.user?.userName);
    if (workOrder === undefined) {
        response.redirect(`${redirectRoot}/?error=notFound`);
        return;
    }
    else if (workOrder.workOrderCloseDateTime !== null) {
        response.redirect(`${redirectRoot}/${workOrder.workOrderId}?error=recordClosed`);
        return;
    }
    // Get thumbnail attachment
    const thumbnailAttachment = await getWorkOrderThumbnailAttachment(request.params.workOrderId);
    const workOrderTypes = await getWorkOrderTypes(request.session.user);
    const workOrderStatuses = await getWorkOrderStatusDataListItems(request.session.user);
    const workOrderPriorities = await getWorkOrderPriorityDataListItems(request.session.user);
    const assignedToOptions = await getAssignedToDataListItems(request.session.user);
    response.render('workOrders/edit', {
        headTitle: `${getConfigProperty('workOrders.sectionNameSingular')} #${workOrder.workOrderNumber}`,
        isCreate: false,
        isEdit: true,
        workOrder,
        thumbnailAttachment,
        assignedToOptions,
        workOrderStatuses,
        workOrderPriorities,
        workOrderTypes
    });
}
