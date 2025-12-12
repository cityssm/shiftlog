import { hoursToMillis } from '@cityssm/to-millis';
export const configDefaultValues = {
    'application.applicationName': 'ShiftLog',
    'application.applicationUrl': undefined,
    'application.backgroundImage': 'background.jpg',
    'application.instance': '',
    'application.httpPort': 9000,
    'application.maximumProcesses': 4,
    'application.attachmentMaximumFileSizeBytes': 20 * 1024 * 1024, // 20 MB
    'application.attachmentStoragePath': 'data/attachments',
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
    'connectors.shiftLog': undefined,
    'connectors.avanti': undefined,
    'connectors.pearl': undefined,
    'connectors.email': undefined,
    // Shifts
    'shifts.isEnabled': false,
    'shifts.router': 'shifts',
    'shifts.sectionName': 'Shifts',
    'shifts.sectionNameSingular': 'Shift',
    'shifts.iconClass': 'fa-calendar-day',
    // Work Orders
    'workOrders.isEnabled': false,
    'workOrders.router': 'workOrders',
    'workOrders.sectionName': 'Work Orders',
    'workOrders.sectionNameSingular': 'Work Order',
    'workOrders.iconClass': 'fa-hard-hat',
    // Timesheets
    'timesheets.isEnabled': false,
    'timesheets.router': 'timesheets',
    'timesheets.sectionName': 'Timesheets',
    'timesheets.sectionNameSingular': 'Timesheet',
    'timesheets.iconClass': 'fa-clock',
    // Employees
    employees: {
        syncSource: ''
    },
    'employees.syncSource': '',
    // Equipment
    equipment: {
        syncSource: ''
    },
    'equipment.syncSource': '',
    // Locations
    locations: {
        syncSource: ''
    },
    'locations.syncSource': ''
};
export default configDefaultValues;
