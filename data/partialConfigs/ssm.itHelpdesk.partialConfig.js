import { config as baseConfig } from './itHelpdesk.partialConfig.js';
export const config = { ...baseConfig };
config.application.attachmentStoragePath = 'data/attachments/itHelpDesk';
config.reverseProxy = {
    trafficIsForwarded: true,
    urlPrefix: '/itHelpDesk'
};
export default config;
