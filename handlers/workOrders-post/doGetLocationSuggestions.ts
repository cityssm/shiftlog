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
    SELECT locationId, locationName, address1, address2, cityProvince, latitude, longitude
    FROM ShiftLog.Locations
    WHERE recordDelete_dateTime IS NULL
    ORDER BY locationName
  `)

  response.json({
    success: true,
    locations: result.recordset
  })
}
