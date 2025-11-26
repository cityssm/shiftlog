import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export default async function addUserGroupMember(
  userGroupId: number,
  userName: string
): Promise<boolean> {
  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('userGroupId', userGroupId)
      .input('instance', getConfigProperty('application.instance'))
      .input('userName', userName).query(/* sql */ `
        insert into ShiftLog.UserGroupMembers (userGroupId, instance, userName)
        values (@userGroupId, @instance, @userName)
      `)

    return true
  } catch {
    return false
  }
}
