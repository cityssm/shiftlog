import mssqlPool from '@cityssm/mssql-multi-pool';
import { clearCacheByTableName } from '../../helpers/cache.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function updateSetting(updateForm) {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const currentDate = new Date();
    // Try to update first
    const updateResult = await pool
        .request()
        .input('settingKey', updateForm.settingKey)
        .input('settingValue', updateForm.settingValue)
        .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      update ShiftLog.ApplicationSettings
      set settingValue = @settingValue,
        previousSettingValue = settingValue,
        recordUpdate_dateTime = @recordUpdate_dateTime
      where settingKey = @settingKey
    `);
    if (updateResult.rowsAffected[0] > 0) {
        clearCacheByTableName('ApplicationSettings');
        return true;
    }
    // If no rows updated, insert new
    const insertResult = await pool
        .request()
        .input('settingKey', updateForm.settingKey)
        .input('settingValue', updateForm.settingValue)
        .input('previousSettingValue', '')
        .input('recordUpdate_dateTime', currentDate).query(/* sql */ `
      insert into ShiftLog.ApplicationSettings (
        settingKey, settingValue, previousSettingValue,
        recordUpdate_dateTime
      )
      values (
        @settingKey, @settingValue, @previousSettingValue,
        @recordUpdate_dateTime
      )
      `);
    if (insertResult.rowsAffected[0] > 0) {
        clearCacheByTableName('ApplicationSettings');
        return true;
    }
    return false;
}
