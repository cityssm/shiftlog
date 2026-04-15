import { config as baseConfig } from './itHelpdesk.partialConfig.js';
export const config = { ...baseConfig };
config.application.attachmentStoragePath = 'data/attachments/itHelpdesk';
config.reverseProxy = {
    trafficIsForwarded: true,
    urlPrefix: '/itHelpdesk'
};
export default config;
