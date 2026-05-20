import { clearCacheByTableName } from '../../helpers/cache.helpers.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface AddTagForm {
  tagName: string
  tagBackgroundColor: string
  tagTextColor: string
}

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

    if (restoreResult.rowsAffected[0] === 0) {
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

      if (insertResult.rowsAffected[0] === 0) {
        return false
      }
    }

    clearCacheByTableName('Tags')

    return true
  } catch {
    return false
  }
}
