/* eslint-disable no-await-in-loop */

import { setTimeout as delay } from 'node:timers/promises'

import { millisecondsInOneHour, secondsToMillis } from '@cityssm/to-millis'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:database:runConnectivityTest`)

export default async function runConnectivityTest(): Promise<boolean> {
  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool.request().query<{ test: 1 }>(/* sql */ `
      SELECT
        1 AS test
    `)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return result.recordset.length === 1 && result.recordset[0].test === 1
  } catch {
    debug('Database connectivity test failed')
    return false
  }
}

const retryIntervalSeconds = 5
const retryIntervalMs = secondsToMillis(retryIntervalSeconds)
const maxRetries = Math.floor(millisecondsInOneHour / retryIntervalMs)

export async function runConnectivityTestUntilSuccess(): Promise<void> {
  let isConnected = false

  let retryCount = 0

  // Try to connect until successful
  while (!isConnected) {
    isConnected = await runConnectivityTest()

    if (!isConnected) {
      debug(
        `Database not yet available, retrying in ${retryIntervalSeconds} seconds...`
      )

      retryCount += 1

      if (retryCount >= maxRetries) {
        throw new Error('Maximum database connectivity retry attempts reached.')
      }

      await delay(retryIntervalMs)
    }
  }
}
