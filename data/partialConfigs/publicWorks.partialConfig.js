import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.session.doKeepAlive = true;
config.shifts = {
    isEnabled: true,
    sectionName: 'Shifts'
};
config.workOrders = {
    isEnabled: false
};
config.timesheets = {
    isEnabled: true,
    sectionName: 'Timesheets'
};
export default config;
