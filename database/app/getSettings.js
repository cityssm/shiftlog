import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { settingProperties } from '../../types/setting.types.js';
export default async function getSettings() {
    const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
    const result = (await pool.request().query(/* sql */ `
      select s.settingKey, s.settingValue, s.previousSettingValue,
        s.recordUpdate_dateTime
      from ShiftLog.ApplicationSettings s
    `));
    const databaseSettings = result.recordset;
    const settings = [
        ...settingProperties
    ];
    for (const databaseSetting of databaseSettings) {
        const settingKey = databaseSetting.settingKey;
        const setting = settings.find(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (property) => property.settingKey === settingKey);
        if (setting !== undefined) {
            Object.assign(setting, databaseSetting);
        }
    }
    return settings;
}
