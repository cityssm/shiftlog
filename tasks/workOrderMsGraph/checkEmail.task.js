import MsGraphMailApi, { wellKnownFolderNames } from '@cityssm/ms-graph-mail';
import { dateToString, dateToTimeString } from '@cityssm/utils-datetime';
import Debug from 'debug';
import createWorkOrder from '../../database/workOrders/createWorkOrder.js';
import createWorkOrderAttachment from '../../database/workOrders/createWorkOrderAttachment.js';
import createWorkOrderNote from '../../database/workOrders/createWorkOrderNote.js';
import getWorkOrder, { getWorkOrderByWorkOrderNumber } from '../../database/workOrders/getWorkOrder.js';
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js';
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getAttachmentStoragePathForFileName } from '../../helpers/upload.helpers.js';
import { writeAttachmentToFileSystem } from './helpers/attachment.helpers.js';
import { fromEmailAddressIsAllowed } from './helpers/messageFrom.helpers.js';
import { messageBodyToText, messageSubjectToWorkOrderNumber } from './helpers/messageText.helpers.js';
const msGraphMailConfig = getConfigProperty('connectors.msGraph');
const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph:checkEmail`);
const systemUser = {
    userName: 'system',
    employeeNumber: '',
    firstName: 'System',
    lastName: 'User',
    userProperties: {
        isAdmin: true,
        workOrders: {
            canManage: true,
            canUpdate: true,
            canView: true
        },
        shifts: {
            canManage: false,
            canUpdate: false,
            canView: false
        },
        timesheets: {
            canManage: false,
            canUpdate: false,
            canView: false
        }
    },
    userSettings: {}
};
export async function checkEmail() {
    debug('Checking email for new messages...');
    const msGraphApi = new MsGraphMailApi(msGraphMailConfig);
    try {
        const messages = (await msGraphApi.listMessages(wellKnownFolderNames.Inbox, {
            select: [
                'id',
                'receivedDateTime',
                'hasAttachments',
                'subject',
                'body',
                'from',
                'toRecipients',
                'ccRecipients',
                'bccRecipients'
            ],
            orderBy: ['receivedDateTime desc']
        }));
        debug(`Found ${messages.length} message(s).`);
        let workOrderType;
        for (const message of messages) {
            const fromAddressLowerCase = message.from?.emailAddress.address.toLowerCase() ?? '';
            if (fromAddressLowerCase === '' ||
                !(await fromEmailAddressIsAllowed(fromAddressLowerCase))) {
                debug(`Archiving message from disallowed address: ${fromAddressLowerCase}`);
                await msGraphApi.archiveMessage(message.id);
                continue;
            }
            const workOrderNumber = messageSubjectToWorkOrderNumber(message.subject ?? '');
            let workOrder = workOrderNumber === undefined
                ? undefined
                : await getWorkOrderByWorkOrderNumber(workOrderNumber);
            if (workOrder !== undefined &&
                (workOrder.requestorContactInfo.toLowerCase() !==
                    fromAddressLowerCase ||
                    !workOrder.requestorIsSubscribed)) {
                const subscribers = await getWorkOrderSubscribers(workOrder.workOrderId);
                const isSubscriber = subscribers.some((subscriber) => subscriber.subscriberEmailAddress.toLowerCase() ===
                    fromAddressLowerCase);
                if (!isSubscriber) {
                    workOrder = undefined;
                }
            }
            const messageBodyText = messageBodyToText(message.body);
            const receivedDateTime = new Date(message.receivedDateTime);
            const receivedDateTimeString = `${dateToString(receivedDateTime)} ${dateToTimeString(receivedDateTime)}`;
            if (workOrder === undefined) {
                if (workOrderType === undefined) {
                    const workOrderTypes = await getWorkOrderTypes();
                    workOrderType =
                        workOrderTypes.length > 0 ? workOrderTypes[0] : undefined;
                }
                if (workOrderType === undefined) {
                    debug('No work order types found. Cannot create work order from email.');
                    break;
                }
                const workOrderId = await createWorkOrder({
                    workOrderTypeId: workOrderType.workOrderTypeId,
                    workOrderDetails: messageBodyText,
                    workOrderTitle: message.subject ?? 'No Subject',
                    requestorContactInfo: fromAddressLowerCase,
                    requestorIsSubscribed: '1',
                    requestorName: message.from?.emailAddress.name ?? '',
                    locationAddress1: '',
                    locationAddress2: '',
                    locationCityProvince: '',
                    workOrderOpenDateTimeString: receivedDateTimeString,
                    workOrderDueDateTimeString: ''
                }, systemUser);
                workOrder = await getWorkOrder(workOrderId);
            }
            else {
                await createWorkOrderNote({
                    workOrderId: workOrder.workOrderId,
                    noteText: `Email received from ${message.from?.emailAddress.address} at ${receivedDateTimeString}:\n\n${messageBodyText}`
                }, fromAddressLowerCase);
            }
            if (workOrder !== undefined && (message.hasAttachments ?? false)) {
                const attachments = await msGraphApi.listMessageAttachments(message.id);
                for (const attachment of attachments) {
                    const storagePaths = getAttachmentStoragePathForFileName(attachment.name);
                    const fileSize = await writeAttachmentToFileSystem(storagePaths.filePath, attachment.contentBytes);
                    await createWorkOrderAttachment({
                        workOrderId: workOrder.workOrderId,
                        attachmentFileName: attachment.name,
                        attachmentFileType: attachment.contentType,
                        attachmentFileSizeInBytes: fileSize,
                        attachmentDescription: `Attachment from email received on ${receivedDateTimeString}`,
                        fileSystemPath: storagePaths.fileSystemPath
                    }, fromAddressLowerCase);
                }
            }
            await msGraphApi.archiveMessage(message.id);
        }
    }
    catch (error) {
        debug('Error checking email:', error);
    }
    finally {
        debug('Finished checking email.');
    }
}
