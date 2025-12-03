/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */
import { Service } from 'node-windows';
import { getServiceConfig } from './windowsService.js';
/*
 * Parse command line arguments for --config parameter
 */
const configArgIndex = process.argv.indexOf('--config');
const configFilePath = configArgIndex !== -1 && process.argv[configArgIndex + 1] !== undefined
    ? process.argv[configArgIndex + 1]
    : undefined;
// Create a new service object
const svc = new Service(getServiceConfig(configFilePath));
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
    svc.start();
});
svc.install();
