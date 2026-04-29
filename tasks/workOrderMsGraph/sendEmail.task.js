import MsGraphMailApi, { MsGraphMailMessageBuilder } from '@cityssm/ms-graph-mail';
import { millisecondsInOneMinute } from '@cityssm/to-millis';
import UniqueTimedEntryQueue from '@cityssm/unique-timed-entry-queue';
import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import { Sema } from 'async-sema';
import Debug from 'debug';
import getWorkOrder from '../../database/workOrders/getWorkOrder.js';
import getWorkOrderNotes from '../../database/workOrders/getWorkOrderNotes.js';
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { isEmailAddress } from './helpers/emailAddress.helpers.js';
import { messageHeaderString } from './helpers/messageText.helpers.js';
const msGraphMailConfig = getConfigProperty('connectors.msGraph');
const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph:sendEmail`);
const workOrderQueue = new UniqueTimedEntryQueue(millisecondsInOneMinute);
const notificationQueueTypes = new Set([
    'workOrder.create',
    'workOrder.update'
]);
const isRunningSemaphore = new Sema(1);
let runAgain = false;
export async function sendEmail() {
    if (isRunningSemaphore.tryAcquire() === undefined) {
        debug('Previous sendEmail task still running, skipping this run');
        runAgain = true;
        return;
    }
    runAgain = false;
    debug('Starting Send Email task');
    const msGraphApi = new MsGraphMailApi(msGraphMailConfig);
    while (!workOrderQueue.isEmpty()) {
        const workOrderId = workOrderQueue.dequeue();
        if (workOrderId === undefined) {
            continue;
        }
        debug(`Processing notifications for work order ID ${workOrderId}`);
        const workOrder = await getWorkOrder(workOrderId);
        if (workOrder === undefined) {
            debug(`Work order ID ${workOrderId} not found, skipping`);
            continue;
        }
        const bccEmailAddresses = new Set();
        if (workOrder.requestorIsSubscribed &&
            isEmailAddress(workOrder.requestorContactInfo)) {
            bccEmailAddresses.add(workOrder.requestorContactInfo);
        }
        const workOrderSubscribers = await getWorkOrderSubscribers(workOrderId);
        for (const subscriber of workOrderSubscribers) {
            if (isEmailAddress(subscriber.subscriberEmailAddress)) {
                bccEmailAddresses.add(subscriber.subscriberEmailAddress);
            }
        }
        if (bccEmailAddresses.size > 0 &&
            workOrder.assignedToEmailAddress !== undefined &&
            isEmailAddress(workOrder.assignedToEmailAddress)) {
            bccEmailAddresses.add(workOrder.assignedToEmailAddress);
        }
        if (bccEmailAddresses.size === 0) {
            debug(`No valid email addresses to send notification for work order ID ${workOrderId}, skipping`);
            continue;
        }
        const workOrderNotes = await getWorkOrderNotes(workOrderId);
        const messageToSend = new MsGraphMailMessageBuilder()
            .addBccRecipients([...bccEmailAddresses])
            .withSubject(`[#${workOrder.workOrderNumber}]: ${workOrder.workOrderTitle}`)
            .withBody(`
          <p style="font-style: italic; color: gray;">
            ${messageHeaderString}
          </p>
        `, 'html')
            .appendToBody(`
          <h1>${workOrder.workOrderNumber}</h1>
          <p>
            <b>${getConfigProperty('workOrders.sectionName')} Type:</b>
            ${workOrder.workOrderType}
          </p>
          <p>
            <b>${getConfigProperty('workOrders.sectionName')} Details:</b><br />
            ${workOrder.workOrderDetails.replaceAll('\n', '<br />')}
          </p>
        `, 'html');
        if (workOrderNotes.length > 0) {
            messageToSend.appendToBody(`
          <h2>Notes:</h2>
        `, 'html');
            for (const note of workOrderNotes) {
                messageToSend.appendToBody(`
            <h3>
              ${note.recordCreate_userName} -
              ${dateToString(note.recordCreate_dateTime)}
              ${dateToTimePeriodString(note.recordCreate_dateTime)}:
            </h3>
            <p>
              ${note.noteText.replaceAll('\n', '<br />')}
            </p>
          `, 'html');
            }
        }
        await msGraphApi.sendMessage(messageToSend.build());
    }
    debug('Send Email task completed');
    isRunningSemaphore.release();
    if (runAgain) {
        debug('Running Send Email again to process queued entries');
        await sendEmail();
    }
}
process.on('message', (message) => {
    if (message.messageType === 'sendNotification' &&
        notificationQueueTypes.has(message.notificationQueue)) {
        debug(`Queuing notification for work order ID ${message.recordId}`);
        workOrderQueue.enqueue(message.recordId);
    }
});
