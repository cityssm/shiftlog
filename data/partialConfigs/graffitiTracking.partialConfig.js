import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.application.applicationName = 'Graffiti Tracking';
config.application.backgroundImage = 'background-graffiti.jpg';
config.application.instance = 'graffiti';
config.shifts = {
    isEnabled: false
};
config.workOrders = {
    isEnabled: true
};
config.timesheets = {
    isEnabled: false
};
export default config;
