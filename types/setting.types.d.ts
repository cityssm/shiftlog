export type SettingKey = 'application.csrfSecret';
export interface SettingProperties {
    settingKey: SettingKey;
    settingName: string;
    description: string;
    type: 'boolean' | 'number' | 'string';
    defaultValue: string;
    isUserConfigurable: boolean;
}
export declare const settingProperties: SettingProperties[];
