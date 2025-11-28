import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.application.applicationName = 'Graffiti Incident Tracking';
config.application.backgroundImage = 'background-graffiti.jpg';
config.application.instance = 'graffiti';
config.shifts = {
    isEnabled: false
};
config.workOrders = {
    isEnabled: true,
    router: 'incidentReports',
    sectionName: 'Incident Reports',
    sectionNameSingular: 'Incident Report',
    iconClass: 'fa-circle-exclamation'
};
config.timesheets = {
    isEnabled: false
};
export default config;
