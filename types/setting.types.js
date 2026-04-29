export const settingProperties = [
    {
        settingKey: 'cleanup.apiAuditLogRetentionDays',
        settingName: 'Cleanup - API Audit Log Retention (Days)',
        description: 'The number of days to retain API audit log records before they are permanently deleted. Set to 0 to disable automatic cleanup.',
        type: 'number',
        defaultValue: '365',
        isUserConfigurable: true
    },
    {
        settingKey: 'cleanup.daysBeforePermanentDelete',
        settingName: 'Cleanup - Days Before Permanent Delete',
        description: 'The number of days a record must be marked as deleted before it is permanently removed from the database.',
        type: 'number',
        defaultValue: '60',
        isUserConfigurable: true
    },
    {
        settingKey: 'locations.defaultCityProvince',
        settingName: 'Locations - Default City/Province',
        description: 'The default city/province to use when creating new work orders and locations.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'locations.defaultLatitude',
        settingName: 'Locations - Default Latitude',
        description: 'The default latitude to use when centering maps.',
        type: 'number',
        defaultValue: '46.5136',
        isUserConfigurable: true
    },
    {
        settingKey: 'locations.defaultLongitude',
        settingName: 'Locations - Default Longitude',
        description: 'The default longitude to use when centering maps.',
        type: 'number',
        defaultValue: '-84.3422',
        isUserConfigurable: true
    },
    {
        settingKey: 'application.csrfSecret',
        settingName: 'Application - CSRF Secret',
        description: 'The secret used for CSRF protection.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: false
    },
    {
        settingKey: 'workOrders.reopenWindowDays',
        settingName: 'Work Orders - Reopen Window (Days)',
        description: 'The number of days after closing a work order that it can be reopened by users with update permissions. Set to 0 to disable reopening.',
        type: 'number',
        defaultValue: '7',
        isUserConfigurable: true
    },
    {
        settingKey: 'msGraph.from.allowedDomains',
        settingName: 'Microsoft Graph - Allowed From Domains',
        description: 'Comma-separated list of email domains that are allowed in the "From" field when creating work orders via Microsoft Graph. If empty, all domains are allowed.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'msGraph.from.allowedEmailAddresses',
        settingName: 'Microsoft Graph - Allowed From Email Addresses',
        description: 'Comma-separated list of specific email addresses that are allowed in the "From" field when creating work orders via Microsoft Graph. If empty, all email addresses are allowed.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'msGraph.from.blockedDomains',
        settingName: 'Microsoft Graph - Blocked From Domains',
        description: 'Comma-separated list of email domains that are blocked in the "From" field when creating work orders via Microsoft Graph. If empty, no domains are blocked.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: true
    },
    {
        settingKey: 'msGraph.from.blockedEmailAddresses',
        settingName: 'Microsoft Graph - Blocked From Email Addresses',
        description: 'Comma-separated list of specific email addresses that are blocked in the "From" field when creating work orders via Microsoft Graph. If empty, no email addresses are blocked.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: true
    }
];
