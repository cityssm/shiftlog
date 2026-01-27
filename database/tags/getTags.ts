import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { Tag } from '../../types/record.types.js'

export default async function getTags(): Promise<Tag[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<Tag>(/* sql */ `
      SELECT
        tagName,
        tagBackgroundColor,
        tagTextColor,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      FROM
        ShiftLog.Tags
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
      ORDER BY
        tagName
    `)

  return result.recordset as Tag[]
}
