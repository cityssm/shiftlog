import path from 'node:path';
import { getConfigProperty } from './helpers/config.helpers.js';
const _dirname = '.';
export function getServiceConfig(configFilePath) {
    const config = {
        name: `ShiftLog (${getConfigProperty('application.instance')})`,
        description: 'A work management system with work order recording, shift activity logging, and timesheet tracking.',
        script: path.join(_dirname, 'index.js')
    };
    if (configFilePath !== undefined && configFilePath !== '') {
        config.env = {
            name: 'CONFIG_FILE',
            value: configFilePath
        };
    }
    return config;
}
export const serviceConfig = getServiceConfig();
