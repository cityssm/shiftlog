import { config as baseConfig } from './partialConfig.js';
export const config = { ...baseConfig };
config.session.doKeepAlive = true;
config.shifts = {
    isEnabled: true,
    sectionName: 'SHifts',
    sectionNameSingular: 'SHift'
};
config.workOrders = {
    isEnabled: false
};
config.timesheets = {
    isEnabled: true,
    sectionName: 'TiMesheets',
    sectionNameSingular: 'TiMesheet'
};
export default config;
