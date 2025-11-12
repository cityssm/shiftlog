import type { Setting } from '../../types/record.types.js';
import type { SettingKey, SettingProperties } from '../../types/setting.types.js';
export declare function getCachedSettings(): Promise<Array<Partial<Setting> & SettingProperties>>;
export declare function getCachedSetting(settingKey: SettingKey): Promise<(Partial<Setting> & SettingProperties) | undefined>;
export declare function getCachedSettingValue(settingKey: SettingKey): Promise<string>;
export declare function clearSettingsCache(): void;
