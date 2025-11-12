import getSettingsFromDatabase from '../../database/app/getSettings.js';
let settings;
export async function getCachedSettings() {
    settings ??= await getSettingsFromDatabase();
    return settings;
}
export async function getCachedSetting(settingKey) {
    const cachedSettings = await getCachedSettings();
    return cachedSettings.find(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (setting) => setting.settingKey === settingKey);
}
export async function getCachedSettingValue(settingKey) {
    const setting = await getCachedSetting(settingKey);
    if (setting === undefined) {
        return '';
    }
    let settingValue = setting.settingValue ?? '';
    if (settingValue === '') {
        settingValue = setting.defaultValue;
    }
    return settingValue;
}
export function clearSettingsCache() {
    settings = undefined;
}
