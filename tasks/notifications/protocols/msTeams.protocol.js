import sendMessageToTeamsWebhook from '@cityssm/ms-teams-workflow-webhook';
import { recordToFactSet } from '@cityssm/ms-teams-workflow-webhook/helpers';
import { getWorkOrderUrl } from '../../../helpers/application.helpers.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { getWorkOrderToSend } from '../helpers/workOrder.helpers.js';
export const sendWorkOrderCreateMsTeamsNotification = async (notificationConfiguration, workOrderId) => {
    const workOrderToSend = await getWorkOrderToSend(workOrderId, notificationConfiguration);
    if (!workOrderToSend?.success) {
        return workOrderToSend;
    }
    const workOrder = workOrderToSend.workOrder;
    const msTeamsSpecificConfig = JSON.parse(notificationConfiguration.notificationTypeFormJson);
    await sendMessageToTeamsWebhook(msTeamsSpecificConfig.webhookUrl, [
        {
            type: 'TextBlock',
            text: `New ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,
            weight: 'bolder'
        },
        recordToFactSet({
            Priority: workOrder.workOrderPriorityDataListItem,
            Status: workOrder.workOrderStatusDataListItem,
            Details: workOrder.workOrderDetails
        })
    ], {
        type: 'Action.OpenUrl',
        title: `View ${getConfigProperty('workOrders.sectionNameSingular')}`,
        url: getWorkOrderUrl(workOrder.workOrderId)
    });
    return { success: true };
};
export const sendWorkOrderUpdateMsTeamsNotification = async (notificationConfiguration, workOrderId) => {
    const workOrderToSend = await getWorkOrderToSend(workOrderId, notificationConfiguration);
    if (!workOrderToSend?.success) {
        return workOrderToSend;
    }
    const workOrder = workOrderToSend.workOrder;
    const msTeamsSpecificConfig = JSON.parse(notificationConfiguration.notificationTypeFormJson);
    await sendMessageToTeamsWebhook(msTeamsSpecificConfig.webhookUrl, [
        {
            type: 'TextBlock',
            text: `Updated ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,
            weight: 'bolder'
        },
        recordToFactSet({
            Priority: workOrder.workOrderPriorityDataListItem,
            Status: workOrder.workOrderStatusDataListItem,
            Details: workOrder.workOrderDetails
        })
    ], {
        type: 'Action.OpenUrl',
        title: `View ${getConfigProperty('workOrders.sectionNameSingular')}`,
        url: getWorkOrderUrl(workOrder.workOrderId)
    });
    return { success: true };
};
