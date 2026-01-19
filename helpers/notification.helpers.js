import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
const debug = Debug(`${DEBUG_NAMESPACE}:helpers.notification:${process.pid}`);
export function sendNotificationWorkerMessage(notificationQueue, recordId) {
    if (process.send === undefined) {
        return;
    }
    const workerMessage = {
        messageType: 'sendNotification',
        notificationQueue,
        recordId,
        sourcePid: process.pid,
        sourceTimeMillis: Date.now(),
        targetProcesses: 'task.notifications'
    };
    debug(`Sending notification worker message: ${notificationQueue} for record ID ${recordId}`);
    process.send(workerMessage);
}
