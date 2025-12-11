import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.application.instance = 'all';
config.shifts = {
    isEnabled: true
};
config.workOrders = {
    isEnabled: true
};
config.timesheets = {
    isEnabled: true
};
export default config;
