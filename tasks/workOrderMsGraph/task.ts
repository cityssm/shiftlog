import { millisecondsInOneMinute, secondsToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import { asyncExitHook } from 'exit-hook'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import {
  type CacheTableNames,
  clearCacheByTableName
} from '../../helpers/cache.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import type {
  ClearCacheWorkerMessage,
  WorkerMessage
} from '../../types/application.types.js'

import { checkEmail } from './checkEmail.task.js'
import { sendEmail } from './sendEmail.task.js'

const debug = Debug(`${DEBUG_NAMESPACE}:tasks.workOrderMsGraph`)

const checkEmailIntervalMillis = millisecondsInOneMinute
const sendEmailIntervalMillis = secondsToMillis(30)

if (getConfigProperty('connectors.msGraph') !== undefined) {
  await checkEmail()

  const checkEmailInterval = setIntervalAsync(
    checkEmail,
    checkEmailIntervalMillis
  )
  const sendEmailInterval = setIntervalAsync(sendEmail, sendEmailIntervalMillis)

  asyncExitHook(
    async () => {
      await clearIntervalAsync(checkEmailInterval)
      await clearIntervalAsync(sendEmailInterval)
    },
    {
      wait: millisecondsInOneMinute
    }
  )
}

process.on('message', (message: WorkerMessage) => {
  if (
    message.messageType === 'clearCache' &&
    message.sourcePid !== process.pid
  ) {
    debug(`Clearing cache: ${(message as ClearCacheWorkerMessage).tableName}`)

    clearCacheByTableName(
      (message as ClearCacheWorkerMessage).tableName as CacheTableNames,
      false
    )
  }
})
