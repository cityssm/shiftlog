import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'
import type { TagAlias } from '../../types/record.types.js'

export default async function getTagAliases(): Promise<TagAlias[]> {
  const pool = await getShiftLogConnectionPool()

  const result = await pool
    .request()
    .input('instance', getConfigProperty('application.instance'))
    .query<TagAlias>(/* sql */ `
      SELECT
        tagNameAlias,
        tagName,
        recordCreate_userName,
        recordCreate_dateTime,
        recordUpdate_userName,
        recordUpdate_dateTime
      FROM
        ShiftLog.TagAliases
      WHERE
        instance = @instance
        AND recordDelete_dateTime IS NULL
      ORDER BY
        tagNameAlias
    `)

  return result.recordset as TagAlias[]
}
