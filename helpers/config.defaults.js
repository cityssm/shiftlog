import { hoursToMillis } from '@cityssm/to-millis';
export const configDefaultValues = {
    'application.applicationName': 'ShiftLog',
    'application.applicationUrl': undefined,
    'application.httpPort': 9000,
    'application.maximumProcesses': 4,
    'login.authentication': undefined,
    'login.domain': '',
    'reverseProxy.disableCompression': false,
    'reverseProxy.disableCsrf': false,
    'reverseProxy.disableEtag': false,
    'reverseProxy.disableRateLimit': false,
    'reverseProxy.trafficIsForwarded': false,
    'reverseProxy.urlPrefix': '',
    'session.cookieName': 'shiftlog-user-sid',
    'session.doKeepAlive': false,
    'session.maxAgeMillis': hoursToMillis(1),
    'session.secret': 'cityssm/shiftlog',
    'connectors.pearl': undefined,
    'connectors.shiftLog': undefined,
    'shifts.isEnabled': false,
    'workOrders.isEnabled': false,
    'timesheets.isEnabled': false
};
export default configDefaultValues;
