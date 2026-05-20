import { clearCacheByTableName } from '../../helpers/cache.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface AddTagForm {
  tagName: string
  tagBackgroundColor: string
  tagTextColor: string
}

const NO_ROWS_AFFECTED = 0

export default async function addTag(
  tagFields: AddTagForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()
    const instance = getConfigProperty('application.instance')

    const restoreResult = await pool
      .request()
      .input('instance', instance)
      .input('tagName', tagFields.tagName)
      .input('tagBackgroundColor', tagFields.tagBackgroundColor)
      .input('tagTextColor', tagFields.tagTextColor)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE ShiftLog.Tags
        SET
          tagBackgroundColor = @tagBackgroundColor,
          tagTextColor = @tagTextColor,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime,
          recordDelete_userName = NULL,
          recordDelete_dateTime = NULL
        WHERE
          instance = @instance
          AND tagName = @tagName
          AND recordDelete_dateTime IS NOT NULL
      `)

    if (restoreResult.rowsAffected[0] > NO_ROWS_AFFECTED) {
      clearCacheByTableName('Tags')
      return true
    }

    const insertResult = await pool
      .request()
      .input('instance', instance)
      .input('tagName', tagFields.tagName)
      .input('tagBackgroundColor', tagFields.tagBackgroundColor)
      .input('tagTextColor', tagFields.tagTextColor)
      .input('recordCreate_userName', user.userName)
      .input('recordCreate_dateTime', currentDate)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        INSERT INTO
          ShiftLog.Tags (
            instance,
            tagName,
            tagBackgroundColor,
            tagTextColor,
            recordCreate_userName,
            recordCreate_dateTime,
            recordUpdate_userName,
            recordUpdate_dateTime
          )
        VALUES
          (
            @instance,
            @tagName,
            @tagBackgroundColor,
            @tagTextColor,
            @recordCreate_userName,
            @recordCreate_dateTime,
            @recordUpdate_userName,
            @recordUpdate_dateTime
          )
      `)

    clearCacheByTableName('Tags')

    return insertResult.rowsAffected[0] > NO_ROWS_AFFECTED
  } catch {
    return false
  }
}
