import publishToNtfy, { DEFAULT_NTFY_SERVER, ntfyMessagePriorityHigh } from '@cityssm/ntfy-publish';
import { getWorkOrderUrl } from '../../../helpers/application.helpers.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { getWorkOrderToSend } from '../helpers/workOrder.helpers.js';
const ntfyConnectorConfig = getConfigProperty('connectors.ntfy');
const ntfyServerUrl = ntfyConnectorConfig?.serverUrl ?? DEFAULT_NTFY_SERVER;
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
