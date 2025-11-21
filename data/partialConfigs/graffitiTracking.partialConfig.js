import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.application.applicationName = 'Graffiti Tracking';
config.application.backgroundImage = 'background-graffiti.jpg';
config.shifts = {
    isEnabled: false
};
config.workOrders = {
    isEnabled: true,
    workOrderNumberPrefix: 'CSD-'
};
config.timesheets = {
    isEnabled: false
};
export default config;
