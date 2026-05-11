import MsGraphMailApi, { MsGraphMailMessageBuilder } from '@cityssm/ms-graph-mail';
import { minutesToMillis } from '@cityssm/to-millis';
import UniqueTimedEntryQueue from '@cityssm/unique-timed-entry-queue';
import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import { Sema } from 'async-sema';
import Debug from 'debug';
import { asyncExitHook } from 'exit-hook';
import getWorkOrder from '../../database/workOrders/getWorkOrder.js';
import getWorkOrderNotes from '../../database/workOrders/getWorkOrderNotes.js';
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getWorkOrderUrl } from '../../helpers/application.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { sendEmailIntervalMillis } from './constants.js';
import { isEmailAddress, isNoReplyEmailAddress } from './helpers/emailAddress.helpers.js';
import { messageHeaderString } from './helpers/messageText.helpers.js';
const msGraphMailConfig = getConfigProperty('connectors.msGraph');
const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph:sendEmail`);
const workOrderQueue = new UniqueTimedEntryQueue(sendEmailIntervalMillis);
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
        if (workOrder.workOrderIsMuted) {
            debug(`Work order ID ${workOrderId} is muted, skipping`);
            continue;
        }
        const bccEmailAddresses = new Set();
        if (workOrder.requestorIsSubscribed &&
            isEmailAddress(workOrder.requestorContactInfo)) {
            bccEmailAddresses.add(workOrder.requestorContactInfo);
        }
        const workOrderSubscribers = await getWorkOrderSubscribers(workOrderId);
        for (const subscriber of workOrderSubscribers) {
            if (isEmailAddress(subscriber.subscriberEmailAddress) &&
                !isNoReplyEmailAddress(subscriber.subscriberEmailAddress)) {
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
        `, 'html');
        if (workOrderNotes.length > 0) {
            messageToSend.appendToBody(`
          <h2>Notes:</h2>
        `, 'html');
            for (const [index, note] of workOrderNotes.entries()) {
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
                if (index < workOrderNotes.length - 1) {
                    messageToSend.appendToBody('<hr />', 'html');
                }
            }
        }
        messageToSend.appendToBody(`
        <div style="padding: 10px; border: 1px solid #333; margin-top: 20px;">
          <h1>${workOrder.workOrderNumber}</h1>
          ${workOrder.workOrderCloseDateTime === null
            ? ''
            : `<p style="color: red; font-weight: bold;">CLOSED</p>`}
          <p>
            <b>${getConfigProperty('workOrders.sectionNameSingular')} Type:</b>
            ${workOrder.workOrderType}
          </p>
          <p>
            <b>${getConfigProperty('workOrders.sectionNameSingular')} Details:</b><br />
            ${workOrder.workOrderDetails.replaceAll('\n', '<br />')}
          </p>
          ${workOrder.assignedToId === null ? '' : `<p><b>Assigned To:</b> ${workOrder.assignedToName}</p>`}
          <p>
            <a href="${getWorkOrderUrl(workOrder.workOrderId)}" rel="noopener noreferrer" target="_blank">
              View ${getConfigProperty('workOrders.sectionNameSingular')}
            </a>
          </p>
        </div>
      `, 'html');
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
asyncExitHook(async () => {
    workOrderQueue.enqueuePending();
    await sendEmail();
}, {
    wait: minutesToMillis(1)
});
