import MsGraphMailApi, {
  type MsGraphMailApiConfig,
  wellKnownFolderNames
} from '@cityssm/ms-graph-mail'
import { millisecondsInOneMinute, minutesToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import { asyncExitHook } from 'exit-hook'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph`)

const msGraphMailConfig = getConfigProperty('connectors.msGraph')

async function checkEmail(): Promise<void> {
  debug('Checking email for new messages...')

  const msGraphApi = new MsGraphMailApi(
    msGraphMailConfig as MsGraphMailApiConfig
  )

  try {
    const messages = await msGraphApi.listMessages(wellKnownFolderNames.Inbox, {
      select: [
        'id',
        'receivedDateTime',
        'hasAttachments',
        'subject',
        'body',
        'sender',
        'toRecipients',
        'ccRecipients',
        'bccRecipients'
      ],

      orderBy: ['receivedDateTime desc']
    })

    debug(`Found ${messages.length} messages.`)

    for (const message of messages) {

        debug(`Processing message with subject: ${message.subject}`)
    }

  } catch (error) {
    debug('Error checking email:', error)
  } finally {
    debug('Finished checking email.')
  }
}

if (msGraphMailConfig !== undefined) {
  await checkEmail()
  const interval = setIntervalAsync(checkEmail, minutesToMillis(5))

  asyncExitHook(
    async () => {
      await clearIntervalAsync(interval)
    },
    {
      wait: millisecondsInOneMinute
    }
  )
}
