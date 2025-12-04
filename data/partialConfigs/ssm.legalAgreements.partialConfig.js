import { config as baseConfig } from './legalAgreements.partialConfig.js';
export const config = { ...baseConfig };
config.application.attachmentStoragePath = 'data/attachments/legalAgreements';
config.reverseProxy = {
    trafficIsForwarded: true,
    urlPrefix: '/legalAgreements'
};
export default config;
