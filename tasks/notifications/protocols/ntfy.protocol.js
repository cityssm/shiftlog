import publishToNtfy, { DEFAULT_NTFY_SERVER, ntfyMessagePriorityHigh } from '@cityssm/ntfy-publish';
import getWorkOrder from '../../../database/workOrders/getWorkOrder.js';
import getWorkOrderMilestones from '../../../database/workOrders/getWorkOrderMilestones.js';
import { getWorkOrderUrl } from '../../../helpers/application.helpers.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
const ntfyConnectorConfig = getConfigProperty('connectors.ntfy');
const ntfyServerUrl = ntfyConnectorConfig?.serverUrl ?? DEFAULT_NTFY_SERVER;
async function getWorkOrderToSend(workOrderId, notificationConfiguration) {
    const workOrder = await getWorkOrder(workOrderId);
    if (workOrder === undefined) {
        return {
            success: false,
            errorMessage: `Work order ID ${workOrderId} not found`
        };
    }
    let sendMessage = notificationConfiguration.assignedToId === null ||
        notificationConfiguration.assignedToId === undefined ||
        notificationConfiguration.assignedToId === workOrder.assignedToId;
    if (!sendMessage && notificationConfiguration.assignedToId !== null) {
        const workOrderMilestones = await getWorkOrderMilestones(workOrderId);
        sendMessage = workOrderMilestones.some((milestone) => milestone.assignedToId === notificationConfiguration.assignedToId);
    }
    if (!sendMessage) {
        return undefined;
    }
    return { success: true, workOrder };
}
export const sendWorkOrderCreateNtfyNotification = async (notificationConfiguration, workOrderId) => {
    const workOrderToSend = await getWorkOrderToSend(workOrderId, notificationConfiguration);
    if (!workOrderToSend?.success) {
        return workOrderToSend;
    }
    const workOrder = workOrderToSend.workOrder;
    const ntfySpecificConfig = JSON.parse(notificationConfiguration.notificationTypeFormJson);
    const success = await publishToNtfy({
        server: ntfyServerUrl,
        topic: ntfySpecificConfig.topic,
        title: getConfigProperty('application.applicationName'),
        message: `New ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,
        clickURL: getWorkOrderUrl(workOrder.workOrderId),
        priority: ntfyMessagePriorityHigh,
        tags: ['star']
    });
    return success
        ? { success: true }
        : {
            success: false,
            errorMessage: 'Failed to send ntfy notification'
        };
};
export const sendWorkOrderUpdateNtfyNotification = async (notificationConfiguration, workOrderId) => {
    const workOrderToSend = await getWorkOrderToSend(workOrderId, notificationConfiguration);
    if (!workOrderToSend?.success) {
        return workOrderToSend;
    }
    const workOrder = workOrderToSend.workOrder;
    const ntfySpecificConfig = JSON.parse(notificationConfiguration.notificationTypeFormJson);
    const success = await publishToNtfy({
        server: ntfyServerUrl,
        topic: ntfySpecificConfig.topic,
        title: getConfigProperty('application.applicationName'),
        message: `Updated ${workOrder.workOrderType}: ${workOrder.workOrderNumber}`,
        clickURL: getWorkOrderUrl(workOrder.workOrderId),
        tags: ['pencil2']
    });
    return success
        ? { success: true }
        : {
            success: false,
            errorMessage: 'Failed to send ntfy notification'
        };
};
