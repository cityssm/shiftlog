import mssqlPool, { type mssql } from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../../helpers/config.helpers.js'

export default async function getApiKeys(): Promise<Record<string, string>> {
  const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'))

  const result = (await pool.request().input('settingKey', 'apiKey')
    .query(/* sql */ `
      select s.userName, s.settingValue
      from ShiftLog.UserSettings s
      where s.settingKey = @settingKey
      and s.userName in (select userName from ShiftLog.Users where isActive = 1 and recordDelete_dateTime is null)
    `)) as mssql.IResult<{ userName: string; settingValue: string }>

  const apiKeys: Record<string, string> = {}

  const rows = result.recordset

  for (const row of rows) {
    apiKeys[row.userName] = row.settingValue
  }

  return apiKeys
}
