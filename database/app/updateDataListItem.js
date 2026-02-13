import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateDataListItem(form) {
    const pool = await getShiftLogConnectionPool();
    // Sanitize colorHex (must be 6 hex digits)
    const colorHexTrimmed = (form.colorHex ?? '').trim().slice(-6);
    const colorHex = /^[\da-f]{6}$/iv.test(colorHexTrimmed)
        ? colorHexTrimmed
        : '000000';
    // Sanitize iconClass (only allow lowercase letters, hyphens, and numbers for Font Awesome classes)
    const iconClassTrimmed = (form.iconClass ?? '').trim();
    const iconClass = /^[\da-z\-]+$/v.test(iconClassTrimmed)
        ? iconClassTrimmed
        : 'circle';
    try {
        const result = await pool
            .request()
            .input('dataListItemId', form.dataListItemId)
            .input('dataListItem', form.dataListItem)
            .input('colorHex', colorHex)
            .input('iconClass', iconClass)
            .input('userGroupId', (form.userGroupId ?? '') === '' ? null : form.userGroupId)
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
      `);
        return result.rowsAffected[0] > 0;
    }
    catch {
        return false;
    }
}
