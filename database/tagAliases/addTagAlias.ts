import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

interface AddTagAliasForm {
  tagNameAlias: string
  tagName: string
}

export default async function addTagAlias(
  tagAliasFields: AddTagAliasForm,
  user: User
): Promise<boolean> {
  const currentDate = new Date()

  try {
    const pool = await getShiftLogConnectionPool()

    await pool
      .request()
      .input('instance', getConfigProperty('application.instance'))
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

    return true
  } catch {
    return false
  }
}
