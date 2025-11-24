import type { Request, Response } from 'express'

import * as mssqlPool from '@cityssm/mssql-multi-pool'
import * as configFunctions from '../../helpers/functions.config.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const pool = mssqlPool.getPool(
    configFunctions.getConfigProperty('mssqlConfig')
  )

  const result = await pool.request().query(`
    SELECT DISTINCT requestorName, requestorContactInfo
    FROM ShiftLog.WorkOrders
    WHERE recordDelete_dateTime IS NULL
      AND requestorName <> ''
    ORDER BY requestorName
  `)

  response.json({
    success: true,
    requestors: result.recordset
  })
}
