import { config as baseConfig } from './all.partialConfig.js';
export const config = { ...baseConfig };
config.application.attachmentStoragePath = 'data/attachments/all';
config.reverseProxy = {
    trafficIsForwarded: true,
    urlPrefix: '/shiftLog'
};
export default config;
