/* eslint-disable no-console, unicorn/filename-case -- Dash is OK */
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
// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', () => {
    console.log('Uninstall complete.');
    console.log('The service exists:', svc.exists);
});
// Uninstall the service.
svc.uninstall();
