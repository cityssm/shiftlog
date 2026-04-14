import { getConfigProperty } from './config.helpers.js';
let applicationUrl = getConfigProperty('application.applicationUrl');
export function getApplicationUrl(request) {
    if ((applicationUrl === undefined || applicationUrl === '') &&
        request !== undefined) {
        applicationUrl = `http://${request.hostname}${getConfigProperty('application.httpPort') === 80
            ? ''
            : `:${getConfigProperty('application.httpPort')}`}${getConfigProperty('reverseProxy.urlPrefix')}`;
    }
    return (applicationUrl ??
        `http://localhost:${getConfigProperty('application.httpPort')}${getConfigProperty('reverseProxy.urlPrefix')}`);
}
export function getWorkOrderUrl(workOrderId) {
    return `${getApplicationUrl()}/${getConfigProperty('workOrders.router')}/${workOrderId}`;
}
