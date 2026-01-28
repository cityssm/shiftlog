import type { UserSettingKey } from '../../types/user.types.js';
export interface UpdateSettingForm {
    settingKey: string;
    settingValue: string;
}
export default function updateUserSetting(userName: string, settingKey: UserSettingKey, settingValue: string): Promise<boolean>;
export declare function updateApiKeyUserSetting(userName: string): Promise<string>;
//# sourceMappingURL=updateUserSetting.d.ts.map