import type { ActiveDirectoryAuthenticatorConfiguration, ADWebAuthAuthenticatorConfiguration, FunctionAuthenticatorConfiguration, PlainTextAuthenticatorConfiguration } from '@cityssm/authentication-helper';
import type { config as MSSQLConfig } from 'mssql';
export declare const configDefaultValues: {
    'application.applicationName': string;
    'application.applicationUrl': string | undefined;
    'application.httpPort': number;
    'application.maximumProcesses': number;
    'login.authentication': {
        config: ActiveDirectoryAuthenticatorConfiguration;
        type: "activeDirectory";
    } | {
        config: ADWebAuthAuthenticatorConfiguration;
        type: "adWebAuth";
    } | {
        config: FunctionAuthenticatorConfiguration;
        type: "function";
    } | {
        config: PlainTextAuthenticatorConfiguration;
        type: "plainText";
    } | undefined;
    'login.domain': string;
    'reverseProxy.disableCompression': boolean;
    'reverseProxy.disableCsrf': boolean;
    'reverseProxy.disableEtag': boolean;
    'reverseProxy.disableRateLimit': boolean;
    'reverseProxy.trafficIsForwarded': boolean;
    'reverseProxy.urlPrefix': string;
    'session.cookieName': string;
    'session.doKeepAlive': boolean;
    'session.maxAgeMillis': number;
    'session.secret': string;
    'connectors.pearl': MSSQLConfig;
    'connectors.shiftLog': MSSQLConfig;
    'shifts.isEnabled': boolean;
    'shifts.router': string;
    'shifts.sectionName': string;
    'shifts.iconClass': string;
    'workOrders.isEnabled': boolean;
    'workOrders.router': string;
    'workOrders.sectionName': string;
    'workOrders.iconClass': string;
    'timesheets.isEnabled': boolean;
    'timesheets.router': string;
    'timesheets.sectionName': string;
    'timesheets.iconClass': string;
};
export default configDefaultValues;
