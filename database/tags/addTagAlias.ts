import { clearCacheByTableName } from '../../helpers/cache.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface AddTagAliasForm {
  tagNameAlias: string
  tagName: string
}

const NO_ROWS_AFFECTED = 0

export default async function addTagAlias(
  tagAliasFields: AddTagAliasForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()
    const instance = getConfigProperty('application.instance')

    const restoreResult = await pool
      .request()
      .input('instance', instance)
      .input('tagNameAlias', tagAliasFields.tagNameAlias)
      .input('tagName', tagAliasFields.tagName)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE ShiftLog.TagAliases
        SET
          tagName = @tagName,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime,
          recordDelete_userName = NULL,
          recordDelete_dateTime = NULL
        WHERE
          instance = @instance
          AND tagNameAlias = @tagNameAlias
          AND recordDelete_dateTime IS NOT NULL
      `)

    if (restoreResult.rowsAffected[0] > NO_ROWS_AFFECTED) {
      return true
    }

    const insertResult = await pool
      .request()
      .input('instance', instance)
      .input('tagNameAlias', tagAliasFields.tagNameAlias)
      .input('tagName', tagAliasFields.tagName)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.TagAliases (
            instance,
            tagNameAlias,
            tagName,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @instance,
            @tagNameAlias,
            @tagName,
            @recordCreate_userName,
            @recordCreate_dateTime,
            @recordUpdate_userName,
            @recordUpdate_dateTime
          )
      `)

    clearCacheByTableName('TagAliases')

    return insertResult.rowsAffected[0] > NO_ROWS_AFFECTED
  } catch {
    return false
  }
}
