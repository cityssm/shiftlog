/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */
import { Service } from 'node-windows';
import { getServiceConfig } from './windowsService.js';
/*
 * Parse command line arguments for --config parameter
 */
const configArgumentIndex = process.argv.indexOf('--config');
const configFilePath = configArgumentIndex !== -1 &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    process.argv[configArgumentIndex + 1] !== undefined
    ? process.argv[configArgumentIndex + 1]
    : undefined;
// Create a new service object
const svc = new Service(getServiceConfig(configFilePath));
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
    svc.start();
});
svc.install();
