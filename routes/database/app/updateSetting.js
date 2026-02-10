import { clearCacheByTableName } from '../../helpers/cache.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function updateSetting(updateForm) {
    const pool = await getShiftLogConnectionPool();
    const currentDate = new Date();
    // Try to update first
    const updateResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('settingKey', updateForm.settingKey)
        .input('settingValue', updateForm.settingValue)
        .input('recordUpdate_dateTime', currentDate)
        .query(/* sql */ `
      UPDATE ShiftLog.ApplicationSettings
      SET
        settingValue = @settingValue,
        previousSettingValue = settingValue,
        recordUpdate_dateTime = @recordUpdate_dateTime
      WHERE
        instance = @instance
        AND settingKey = @settingKey
    `);
    if (updateResult.rowsAffected[0] > 0) {
        clearCacheByTableName('ApplicationSettings');
        return true;
    }
    // If no rows updated, insert new
    const insertResult = await pool
        .request()
        .input('instance', getConfigProperty('application.instance'))
        .input('settingKey', updateForm.settingKey)
        .input('settingValue', updateForm.settingValue)
        .input('previousSettingValue', '')
        .input('recordUpdate_dateTime', currentDate)
        .query(/* sql */ `
      INSERT INTO
        ShiftLog.ApplicationSettings (
          instance,
          settingKey,
          settingValue,
          previousSettingValue,
          recordUpdate_dateTime
        )
      VALUES
        (
          @instance,
          @settingKey,
          @settingValue,
          @previousSettingValue,
          @recordUpdate_dateTime
        )
    `);
    if (insertResult.rowsAffected[0] > 0) {
        clearCacheByTableName('ApplicationSettings');
        return true;
    }
    return false;
}
