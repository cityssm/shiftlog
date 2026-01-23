export type SettingKey = 'application.csrfSecret' | 'cleanup.apiAuditLogRetentionDays' | 'cleanup.daysBeforePermanentDelete' | 'locations.defaultCityProvince' | 'locations.defaultLatitude' | 'locations.defaultLongitude' | 'workOrders.reopenWindowDays';
export interface SettingProperties {
    settingKey: SettingKey;
    settingName: string;
    description: string;
    type: 'boolean' | 'number' | 'string';
    defaultValue: string;
    isUserConfigurable: boolean;
}
export declare const settingProperties: SettingProperties[];
//# sourceMappingURL=setting.types.d.ts.map