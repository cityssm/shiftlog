import type { ServiceConfig } from 'node-windows';
/**
 * Get the Windows service configuration
 * @param configFilePath - Optional path to the config file (defaults to data/config.js)
 * @returns ServiceConfig object for node-windows
 */
export declare function getServiceConfig(configFilePath?: string): ServiceConfig;
export declare const serviceConfig: ServiceConfig;
