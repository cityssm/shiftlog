import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.application.applicationName = 'Accessibility Reporting';
config.shifts = {
    isEnabled: false
};
config.workOrders = {
    isEnabled: true,
    router: 'accessibilityReports',
    sectionName: 'Accessibility Reports',
    iconClass: 'fa-wheelchair'
};
config.timesheets = {
    isEnabled: false
};
export default config;
