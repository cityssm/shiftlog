import { Service } from 'node-windows';
import { getServiceConfig } from './windowsService.js';
const configArgumentIndex = process.argv.indexOf('--config');
const configFilePath = configArgumentIndex !== -1 &&
    process.argv[configArgumentIndex + 1] !== undefined
    ? process.argv[configArgumentIndex + 1]
    : undefined;
const svc = new Service(getServiceConfig(configFilePath));
svc.on('uninstall', () => {
    console.log('Uninstall complete.');
    console.log('The service exists:', svc.exists);
});
svc.uninstall();
