import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js'

export interface UpdateDataListItemForm {
  dataListItemId: number
  dataListItem: string
  colorHex?: string
  iconClass?: string
  userGroupId?: number | string | null
  userName: string
}

export default async function updateDataListItem(
  form: UpdateDataListItemForm
): Promise<boolean> {
  const pool = await getShiftLogConnectionPool()

  try {
    const result = await pool
      .request()
      .input('dataListItemId', form.dataListItemId)
      .input('dataListItem', form.dataListItem)
      .input('colorHex', (form.colorHex ?? '').trim() || '000000')
      .input('iconClass', (form.iconClass ?? '').trim() || 'circle')
      .input(
        'userGroupId',
        (form.userGroupId ?? '') === '' ? null : form.userGroupId
      )
      .input('userName', form.userName)
      .query(/* sql */ `
        UPDATE ShiftLog.DataListItems
        SET
          dataListItem = @dataListItem,
          colorHex = @colorHex,
          iconClass = @iconClass,
          userGroupId = @userGroupId,
          recordUpdate_userName = @userName,
          recordUpdate_dateTime = getdate()
        WHERE
          dataListItemId = @dataListItemId
          AND recordDelete_dateTime IS NULL
      `)

    return result.rowsAffected[0] > 0
  } catch {
    return false
  }
}
