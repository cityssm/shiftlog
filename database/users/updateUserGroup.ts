import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function updateUserGroup(
  userGroupId: number,
  userGroupName: string,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    const result = await pool
      .request()
      .input('userGroupId', userGroupId)
      .input('instance', getConfigProperty('application.instance'))
      .input('userGroupName', userGroupName)
      .input('recordUpdate_userName', user.userName)
      .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
        update ShiftLog.UserGroups
        set userGroupName = @userGroupName,
          recordUpdate_userName = @recordUpdate_userName,
          recordUpdate_dateTime = @recordUpdate_dateTime
        where userGroupId = @userGroupId
          and instance = @instance
          and recordDelete_dateTime is null
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
