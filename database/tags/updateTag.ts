import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface UpdateTagForm {
  tagName: string
  tagBackgroundColor: string
  tagTextColor: string
}

export default async function updateTag(
  updateTagForm: UpdateTagForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
      .input('tagName', updateTagForm.tagName)
      .input('tagBackgroundColor', updateTagForm.tagBackgroundColor)
      .input('tagTextColor', updateTagForm.tagTextColor)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate)
      .query(/* sql */ `
        UPDATE ShiftLog.Tags
        SET
          tagBackgroundColor = @tagBackgroundColor,
          tagTextColor = @tagTextColor,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        WHERE
          tagName = @tagName
          AND instance = @instance
          AND recordDelete_dateTime IS NULL
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
