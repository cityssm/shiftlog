/* eslint-disable no-await-in-loop */

import NodeCache from '@cacheable/node-cache'
import MsGraphMailApi, {
  type MsGraphMailApiConfig,
  type MsGraphMailMessage,
  wellKnownFolderNames
} from '@cityssm/ms-graph-mail'
import { minutesToSeconds, secondsInOneHour } from '@cityssm/to-millis'
import {
  type DateString,
  type TimeString,
  dateToString,
  dateToTimeString
} from '@cityssm/utils-datetime'
import Debug from 'debug'

import addWorkOrderSubscriber from '../../database/workOrders/addWorkOrderSubscriber.js'
import checkWorkOrderAttachmentChecksum from '../../database/workOrders/checkWorkOrderAttachmentChecksum.js'
import createWorkOrder from '../../database/workOrders/createWorkOrder.js'
import createWorkOrderAttachment from '../../database/workOrders/createWorkOrderAttachment.js'
import createWorkOrderNote from '../../database/workOrders/createWorkOrderNote.js'
import getWorkOrder, {
  getWorkOrderByWorkOrderNumber
} from '../../database/workOrders/getWorkOrder.js'
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js'
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getCachedSettingValue } from '../../helpers/cache/settings.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getAttachmentStoragePathForFileName } from '../../helpers/upload.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

import {
  attachmentContentBytesToBuffer,
  attachmentContentBytesToChecksum,
  getAttachmentFileNameFromFileName,
  writeAttachmentToFileSystem
} from './helpers/attachment.helpers.js'
import {
  getSubscriberEmailAddresses,
  isNoReplyEmailAddress
} from './helpers/emailAddress.helpers.js'
import { fromEmailAddressIsAllowed } from './helpers/messageFrom.helpers.js'
import {
  messageBodyToText,
  messageSubjectToWorkOrderNumber,
  messageTextToLocation
} from './helpers/messageText.helpers.js'

const msGraphMailConfig = getConfigProperty('connectors.msGraph')

const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph:checkEmail`)

const messageIdCache = new NodeCache({
  checkperiod: minutesToSeconds(10),
  stdTTL: secondsInOneHour
})

const systemUser: User = {
  userName: 'system',

  employeeNumber: '',

  emailAddress: '',
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
}

export async function checkEmail(): Promise<void> {
  if (await getCachedSettingValue('msGraph.enabled') !== 'true') {
    debug('Microsoft Graph integration is disabled. Skipping email check.')
    return
  }

  debug('Checking email for new messages...')

  const msGraphApi = new MsGraphMailApi(
    msGraphMailConfig as MsGraphMailApiConfig
  )

  try {
    const messages = (await msGraphApi.listMessages(
      wellKnownFolderNames.Inbox,
      {
        select: [
          'id',
          'receivedDateTime',
          'subject',
          'body',
          'from',
          'toRecipients',
          'ccRecipients',
          'bccRecipients'
        ],

        orderBy: ['receivedDateTime desc']
      }
    )) as Array<
      Pick<
        MsGraphMailMessage,
        | 'bccRecipients'
        | 'body'
        | 'ccRecipients'
        | 'from'
        | 'id'
        | 'receivedDateTime'
        | 'subject'
        | 'toRecipients'
      >
    >

    debug(`Found ${messages.length} message(s).`)

    let workOrderType: WorkOrderType | undefined

    for (const message of messages) {
      await msGraphApi.markMessageAsRead(message.id)

      /* Archive the message if it has already been processed.
       * This can happen if the same message is returned by the API in multiple runs of this task before it is archived.
       */

      if (messageIdCache.has(message.id)) {
        debug(
          `Archiving message that has already been processed: ${message.id}`
        )

        await msGraphApi.archiveMessage(message.id)

        messageIdCache.take(message.id)

        continue
      }

      /*
       * Verify that the message is from an allowed email address before doing any further processing.
       * If the message is from a disallowed email address, archive it and skip to the next message.
       */

      const fromAddressLowerCase =
        message.from?.emailAddress.address.toLowerCase() ?? ''

      if (
        fromAddressLowerCase === '' ||
        !(await fromEmailAddressIsAllowed(fromAddressLowerCase))
      ) {
        debug(
          `Archiving message from disallowed address: ${fromAddressLowerCase}`
        )

        await msGraphApi.archiveMessage(message.id)

        continue
      }

      /*
       * Check if the message is for an existing work order by looking for a work order number in the subject.
       */

      const workOrderNumber = messageSubjectToWorkOrderNumber(
        message.subject ?? ''
      )

      let workOrder =
        workOrderNumber === undefined
          ? undefined
          : await getWorkOrderByWorkOrderNumber(workOrderNumber)

      if (
        workOrder !== undefined &&
        (workOrder.requestorContactInfo.toLowerCase() !==
          fromAddressLowerCase ||
          !workOrder.requestorIsSubscribed)
      ) {
        const subscribers = await getWorkOrderSubscribers(workOrder.workOrderId)

        const isSubscriber = subscribers.some(
          (subscriber) =>
            subscriber.subscriberEmailAddress.toLowerCase() ===
            fromAddressLowerCase
        )

        if (!isSubscriber) {
          workOrder = undefined
        }
      }

      /*
       * Sanitize the email body
       */

      const messageBodyText = messageBodyToText(
        message.body,
        workOrder !== undefined
      )

      const receivedDateTime = new Date(message.receivedDateTime as string)

      const receivedDateTimeString =
        `${dateToString(receivedDateTime)} ${dateToTimeString(receivedDateTime)}` as `${DateString} ${TimeString}`

      /*
       * Create record of the message in the database, linked to the work order if applicable.
       */

      if (workOrder === undefined) {
        if (workOrderType === undefined) {
          const workOrderTypes = await getWorkOrderTypes()

          workOrderType =
            workOrderTypes.length > 0 ? workOrderTypes[0] : undefined
        }

        if (workOrderType === undefined) {
          debug(
            'No work order types found. Cannot create work order from email.'
          )
          break
        }

        const workOrderLocation = await messageTextToLocation(messageBodyText)

        const workOrderId = await createWorkOrder(
          {
            workOrderTypeId: workOrderType.workOrderTypeId,

            workOrderDetails: messageBodyText,
            workOrderTitle: message.subject ?? 'No Subject',

            requestorContactInfo: fromAddressLowerCase,
            requestorIsSubscribed: isNoReplyEmailAddress(
              fromAddressLowerCase,
              message.from?.emailAddress.name
            )
              ? undefined
              : '1',
            requestorName: message.from?.emailAddress.name ?? '',

            locationAddress1: workOrderLocation?.address1 ?? '',
            locationAddress2: workOrderLocation?.address2 ?? '',
            locationCityProvince: workOrderLocation?.cityProvince ?? '',
            locationLatitude: workOrderLocation?.latitude ?? '',
            locationLongitude: workOrderLocation?.longitude ?? '',

            workOrderOpenDateTimeString: receivedDateTimeString,

            workOrderDueDateTimeString: ''
          },
          systemUser
        )

        workOrder = await getWorkOrder(workOrderId)

        const subscribersEmailAddresses = getSubscriberEmailAddresses(message)

        for (const subscriberEmailAddress of subscribersEmailAddresses) {
          if (!isNoReplyEmailAddress(subscriberEmailAddress)) {
            await addWorkOrderSubscriber(
              workOrderId,
              subscriberEmailAddress,
              systemUser.userName
            )
          }
        }
      } else {
        await createWorkOrderNote(
          {
            workOrderId: workOrder.workOrderId,

            noteText: messageBodyText,

            recordCreate_dateTime: receivedDateTime
          },
          fromAddressLowerCase
        )
      }

      messageIdCache.set(message.id, true)

      /*
       * Save any attachments to the work order
       */

      if (workOrder !== undefined) {
        try {
          const attachments = await msGraphApi.listMessageAttachments(
            message.id
          )

          for (const attachment of attachments) {
            const attachmentContentBuffer = attachmentContentBytesToBuffer(
              attachment.contentBytes
            )

            const attachmentChecksum = attachmentContentBytesToChecksum(
              attachmentContentBuffer
            )

            const attachmentAlreadyExists =
              await checkWorkOrderAttachmentChecksum(
                workOrder.workOrderId,
                attachmentChecksum
              )

            // eslint-disable-next-line max-depth
            if (attachmentAlreadyExists) {
              debug(
                `Attachment with checksum ${attachmentChecksum} already exists for work order ${workOrder.workOrderId}. Skipping attachment.`
              )

              continue
            }

            const attachmentFileName = getAttachmentFileNameFromFileName(
              attachment.name
            )

            const storagePaths =
              getAttachmentStoragePathForFileName(attachmentFileName)

            const fileSize = await writeAttachmentToFileSystem(
              storagePaths.filePath,
              attachmentContentBuffer
            )

            await createWorkOrderAttachment(
              {
                workOrderId: workOrder.workOrderId,
                attachmentFileName: attachmentFileName,
                attachmentFileType: attachment.contentType,
                attachmentFileSizeInBytes: fileSize,
                attachmentDescription: `Attachment from email received on ${receivedDateTimeString}`,
                fileSystemPath: storagePaths.fileSystemPath,
                fileChecksum: attachmentChecksum
              },
              fromAddressLowerCase
            )
          }
        } catch (error) {
          debug(
            `Error processing attachments for message ${message.id}:`,
            error
          )
        }
      }

      // Archive the message after processing
      await msGraphApi.archiveMessage(message.id)

      messageIdCache.take(message.id)
    }
  } catch (error) {
    debug('Error checking email:', error)
  } finally {
    debug('Finished checking email.')
  }
}
