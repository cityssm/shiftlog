import { clearCacheByTableName } from '../../helpers/cache.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function deleteTagAlias(
  tagNameAlias: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('tagNameAlias', tagNameAlias)
      .input('recordDelete_userName', user.userName)
      .input('recordDelete_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE ShiftLog.TagAliases
        SET
          recordDelete_userName = @recordDelete_userName,
          recordDelete_dateTime = @recordDelete_dateTime
        WHERE
          tagNameAlias = @tagNameAlias
          AND instance = @instance
          AND recordDelete_dateTime IS NULL
      `)

    clearCacheByTableName('TagAliases')

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
