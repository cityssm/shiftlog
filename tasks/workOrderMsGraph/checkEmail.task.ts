/* eslint-disable no-await-in-loop */
import MsGraphMailApi, {
  type MsGraphMailApiConfig,
  type MsGraphMailMessage,
  wellKnownFolderNames
} from '@cityssm/ms-graph-mail'
import {
  type DateString,
  type TimeString,
  dateToString,
  dateToTimeString
} from '@cityssm/utils-datetime'
import Debug from 'debug'

import createWorkOrder from '../../database/workOrders/createWorkOrder.js'
import createWorkOrderAttachment from '../../database/workOrders/createWorkOrderAttachment.js'
import createWorkOrderNote from '../../database/workOrders/createWorkOrderNote.js'
import getWorkOrder, {
  getWorkOrderByWorkOrderNumber
} from '../../database/workOrders/getWorkOrder.js'
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js'
import getWorkOrderTypes from '../../database/workOrderTypes/getWorkOrderTypes.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getAttachmentStoragePathForFileName } from '../../helpers/upload.helpers.js'
import type { WorkOrderType } from '../../types/record.types.js'

import { writeAttachmentToFileSystem } from './helpers/attachment.helpers.js'
import { fromEmailAddressIsAllowed } from './helpers/messageFrom.helpers.js'
import {
  messageBodyToText,
  messageHeaderString,
  messageSubjectToWorkOrderNumber
} from './helpers/messageText.helpers.js'

const msGraphMailConfig = getConfigProperty('connectors.msGraph')

const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph:checkEmail`)

const systemUser: User = {
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
}

export async function checkEmail(): Promise<void> {
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
          'hasAttachments',
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
        | 'hasAttachments'
        | 'id'
        | 'receivedDateTime'
        | 'subject'
        | 'toRecipients'
      >
    >

    debug(`Found ${messages.length} message(s).`)

    let workOrderType: WorkOrderType | undefined

    for (const message of messages) {
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

      let messageBodyText = messageBodyToText(message.body)

      if (messageBodyText.includes(messageHeaderString)) {
        messageBodyText = messageBodyText.split(messageHeaderString)[0].trim()
      }

      if (messageBodyText.includes('---\n\n**From:**')) {
        messageBodyText = messageBodyText.split('---\n\n**From:**')[0].trim()
      }

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

        const workOrderId = await createWorkOrder(
          {
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
          },
          systemUser
        )

        workOrder = await getWorkOrder(workOrderId)
      } else {
        await createWorkOrderNote(
          {
            workOrderId: workOrder.workOrderId,

            noteText: messageBodyText,

            recordCreate_dateTime: receivedDateTime,
          },
          fromAddressLowerCase
        )
      }

      /*
       * Save any attachments to the work order
       */

      if (workOrder !== undefined && (message.hasAttachments ?? false)) {
        const attachments = await msGraphApi.listMessageAttachments(message.id)

        for (const attachment of attachments) {

          const storagePaths = getAttachmentStoragePathForFileName(attachment.name)

          const fileSize = await writeAttachmentToFileSystem(
            storagePaths.filePath,
            attachment.contentBytes
          )

          await createWorkOrderAttachment(
            {
              workOrderId: workOrder.workOrderId,
              attachmentFileName: attachment.name,
              attachmentFileType: attachment.contentType,
              attachmentFileSizeInBytes: fileSize,
              attachmentDescription: `Attachment from email received on ${receivedDateTimeString}`,
              fileSystemPath: storagePaths.fileSystemPath
            },
            fromAddressLowerCase
          )
        }
      }



      // Archive the message after processing
      await msGraphApi.archiveMessage(message.id)
    }
  } catch (error) {
    debug('Error checking email:', error)
  } finally {
    debug('Finished checking email.')
  }
}
