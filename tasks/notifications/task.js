import { millisecondsInOneHour, minutesToMillis } from '@cityssm/to-millis';
import UniqueTimedEntryQueue from '@cityssm/unique-timed-entry-queue';
import { Sema } from 'async-sema';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed';
import getNotificationConfigurations from '../../database/notifications/getNotificationConfigurations.js';
import recordNotificationLog from '../../database/notifications/recordNotificationLog.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getProtocolFunction } from './protocols/protocol.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks.notifications`);
const createMillis = minutesToMillis(1);
const updateMillis = minutesToMillis(2);
const pollingIntervalMillis = millisecondsInOneHour;
const notificationQueues = {};
if (getConfigProperty('workOrders.isEnabled')) {
    notificationQueues['workOrder.create'] = new UniqueTimedEntryQueue(createMillis);
    notificationQueues['workOrder.update'] = new UniqueTimedEntryQueue(updateMillis);
}
const isRunningSemaphore = new Sema(1);
let runAgain = false;
async function sendNotifications() {
    if (isRunningSemaphore.tryAcquire() === undefined) {
        debug('Previous notification task still running, skipping this run');
        runAgain = true;
        return;
    }
    runAgain = false;
    const notificationConfigurationsByQueue = {};
    for (const [notificationQueueType, notificationQueue] of Object.entries(notificationQueues)) {
        debug(`Processing notification queue: ${notificationQueueType}`);
        while (!notificationQueue.isEmpty()) {
            const recordId = notificationQueue.dequeue();
            if (recordId === undefined) {
                continue;
            }
            let notificationConfigurations = notificationConfigurationsByQueue[notificationQueueType];
            if (notificationConfigurations === undefined) {
                // eslint-disable-next-line no-await-in-loop
                notificationConfigurations = await getNotificationConfigurations(notificationQueueType);
                notificationConfigurationsByQueue[notificationQueueType] = notificationConfigurations;
            }
            if (notificationConfigurations.length === 0) {
                notificationQueue.clearAll();
                continue;
            }
            for (const notificationConfiguration of notificationConfigurations) {
                if (!notificationConfiguration.isActive) {
                    continue;
                }
                debug(`Sending notification: ${notificationQueueType} for record ID ${recordId}`);
                const protocolFunction = getProtocolFunction(notificationConfiguration.notificationType, notificationQueueType);
                if (protocolFunction === undefined) {
                    debug(`No protocol function found for notification queue: ${notificationConfiguration.notificationQueue}`);
                }
                else {
                    let notificationResult;
                    try {
                        // eslint-disable-next-line no-await-in-loop
                        notificationResult = await protocolFunction(notificationConfiguration, recordId);
                    }
                    catch (error) {
                        debug('Error in sendNotifications:', error);
                        notificationResult = {
                            success: false,
                            errorMessage: error.message
                        };
                    }
                    if (notificationResult !== undefined) {
                        // eslint-disable-next-line no-await-in-loop
                        await recordNotificationLog({
                            notificationConfigurationId: notificationConfiguration.notificationConfigurationId,
                            recordId,
                            notificationDate: new Date(),
                            isSuccess: notificationResult.success,
                            errorMessage: notificationResult.success
                                ? ''
                                : (notificationResult.errorMessage ?? 'Unknown error')
                        });
                    }
                }
            }
        }
    }
    debug('Notification task completed');
    isRunningSemaphore.release();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (runAgain) {
        debug('Running sendNotifications again to process queued entries');
        await sendNotifications();
    }
}
/*
 * Message Handling
 */
process.on('message', (message) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (message.messageType !== 'sendNotification') {
        return;
    }
    debug(`Received notification request: ${message.notificationQueue} for record ID ${message.recordId}`);
    switch (message.notificationQueue) {
        case 'workOrder.create': {
            notificationQueues[message.notificationQueue]?.enqueue(message.recordId);
            break;
        }
        case 'workOrder.update': {
            if (notificationQueues['workOrder.create']?.hasPendingEntry(message.recordId) ??
                false) {
                // If a create notification is pending, skip the update and reset the timer
                notificationQueues['workOrder.create']?.enqueue(message.recordId, updateMillis);
            }
            else {
                notificationQueues['workOrder.update']?.enqueue(message.recordId);
            }
            break;
        }
    }
});
/*
 * Schedule
 */
if (Object.keys(notificationQueues).length > 0) {
    for (const notificationQueue of Object.values(notificationQueues)) {
        notificationQueue.addEventListener('enqueue', () => {
            if (isRunningSemaphore.tryAcquire() !== undefined) {
                isRunningSemaphore.release();
                void sendNotifications();
            }
        });
    }
    const intervalTimer = setIntervalAsync(async () => {
        await sendNotifications();
    }, pollingIntervalMillis);
    exitHook(() => {
        void clearIntervalAsync(intervalTimer);
    });
}
