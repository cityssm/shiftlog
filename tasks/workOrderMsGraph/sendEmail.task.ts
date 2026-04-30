import MsGraphMailApi, {
  type MsGraphMailApiConfig,
  MsGraphMailMessageBuilder
} from '@cityssm/ms-graph-mail'
import { minutesToMillis, secondsToMillis } from '@cityssm/to-millis'
import UniqueTimedEntryQueue from '@cityssm/unique-timed-entry-queue'
import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime'
import { Sema } from 'async-sema'
import Debug from 'debug'
import { asyncExitHook } from 'exit-hook'

import getWorkOrder from '../../database/workOrders/getWorkOrder.js'
import getWorkOrderNotes from '../../database/workOrders/getWorkOrderNotes.js'
import getWorkOrderSubscribers from '../../database/workOrders/getWorkOrderSubscribers.js'
import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type {
  SendNotificationWorkerMessage,
  WorkerMessage
} from '../../types/application.types.js'
import type { NotificationQueueType } from '../notifications/types.js'

import { isEmailAddress } from './helpers/emailAddress.helpers.js'
import { messageHeaderString } from './helpers/messageText.helpers.js'

const msGraphMailConfig = getConfigProperty('connectors.msGraph')

const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph:sendEmail`)

const workOrderQueue = new UniqueTimedEntryQueue(secondsToMillis(30))

const notificationQueueTypes = new Set<Partial<NotificationQueueType>>([
  'workOrder.create',
  'workOrder.update'
])

const isRunningSemaphore = new Sema(1)
let runAgain = false

export async function sendEmail(): Promise<void> {
  if (isRunningSemaphore.tryAcquire() === undefined) {
    debug('Previous sendEmail task still running, skipping this run')
    runAgain = true
    return
  }

  runAgain = false

  debug('Starting Send Email task')

  const msGraphApi = new MsGraphMailApi(
    msGraphMailConfig as MsGraphMailApiConfig
  )

  while (!workOrderQueue.isEmpty()) {
    const workOrderId = workOrderQueue.dequeue()

    if (workOrderId === undefined) {
      continue
    }

    debug(`Processing notifications for work order ID ${workOrderId}`)

    /*
     * Get the work order
     */

    const workOrder = await getWorkOrder(workOrderId)

    if (workOrder === undefined) {
      debug(`Work order ID ${workOrderId} not found, skipping`)
      continue
    }

    const bccEmailAddresses = new Set<string>()

    if (
      workOrder.requestorIsSubscribed &&
      isEmailAddress(workOrder.requestorContactInfo)
    ) {
      bccEmailAddresses.add(workOrder.requestorContactInfo)
    }

    /*
     * Get the subscribers
     */

    const workOrderSubscribers = await getWorkOrderSubscribers(workOrderId)

    for (const subscriber of workOrderSubscribers) {
      if (isEmailAddress(subscriber.subscriberEmailAddress)) {
        bccEmailAddresses.add(subscriber.subscriberEmailAddress)
      }
    }

    if (
      bccEmailAddresses.size > 0 &&
      workOrder.assignedToEmailAddress !== undefined &&
      isEmailAddress(workOrder.assignedToEmailAddress)
    ) {
      bccEmailAddresses.add(workOrder.assignedToEmailAddress)
    }

    if (bccEmailAddresses.size === 0) {
      debug(
        `No valid email addresses to send notification for work order ID ${workOrderId}, skipping`
      )
      continue
    }

    /*
     * Get the work order notes to include in the email
     */

    const workOrderNotes = await getWorkOrderNotes(workOrderId)

    /*
     * Build the email
     */

    const messageToSend = new MsGraphMailMessageBuilder()
      .addBccRecipients([...bccEmailAddresses])
      .withSubject(
        `[#${workOrder.workOrderNumber}]: ${workOrder.workOrderTitle}`
      )
      .withBody(
        /* html */ `
          <p style="font-style: italic; color: gray;">
            ${messageHeaderString}
          </p>
        `,
        'html'
      )
      .appendToBody(
        /* html */ `
          <h1>${workOrder.workOrderNumber}</h1>
          <p>
            <b>${getConfigProperty('workOrders.sectionNameSingular')} Type:</b>
            ${workOrder.workOrderType}
          </p>
          <p>
            <b>${getConfigProperty('workOrders.sectionNameSingular')} Details:</b><br />
            ${workOrder.workOrderDetails.replaceAll('\n', '<br />')}
          </p>
        `,
        'html'
      )

    if (workOrder.assignedToId !== null) {
      messageToSend.appendToBody(
        /* html */ `
          <p>
            <b>Assigned To:</b>
            ${workOrder.assignedToName}
          </p>
        `,
        'html'
      )
    }

    if (workOrderNotes.length > 0) {
      messageToSend.appendToBody(
        /* html */ `
          <h2>Notes:</h2>
        `,
        'html'
      )

      for (const [index, note] of workOrderNotes.entries()) {
        messageToSend.appendToBody(
          /* html */ `
            <h3>
              ${note.recordCreate_userName} -
              ${dateToString(note.recordCreate_dateTime)}
              ${dateToTimePeriodString(note.recordCreate_dateTime)}:
            </h3>
            <p>
              ${note.noteText.replaceAll('\n', '<br />')}
            </p>
          `,
          'html'
        )

        if (index < workOrderNotes.length - 1) {
          messageToSend.appendToBody('<hr />', 'html')
        }
      }
    }

    /*
     * Send the email
     */

    // eslint-disable-next-line no-await-in-loop
    await msGraphApi.sendMessage(messageToSend.build())
  }

  debug('Send Email task completed')
  isRunningSemaphore.release()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (runAgain) {
    debug('Running Send Email again to process queued entries')
    await sendEmail()
  }
}

process.on('message', (message: WorkerMessage) => {
  if (
    message.messageType === 'sendNotification' &&
    notificationQueueTypes.has(
      (message as SendNotificationWorkerMessage).notificationQueue
    )
  ) {
    debug(
      `Queuing notification for work order ID ${(message as SendNotificationWorkerMessage).recordId}`
    )
    workOrderQueue.enqueue((message as SendNotificationWorkerMessage).recordId)
  }
})

asyncExitHook(
  async () => {
    workOrderQueue.enqueuePending()
    await sendEmail()
  },
  {
    wait: minutesToMillis(1)
  }
)
