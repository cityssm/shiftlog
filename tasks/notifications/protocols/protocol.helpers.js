import { getConfigProperty } from '../../../helpers/config.helpers.js';
const protocolFunctions = {};
const enabledProtocols = getConfigProperty('notifications.protocols', []);
if (enabledProtocols.includes('ntfy')) {
    const ntfyModule = await import('./ntfy.protocol.js');
    protocolFunctions.ntfy = {
        'workOrder.create': ntfyModule.sendWorkOrderCreateNtfyNotification,
        'workOrder.update': ntfyModule.sendWorkOrderUpdateNtfyNotification
    };
}
if (enabledProtocols.includes('email')) {
    const emailModule = await import('./email.protocol.js');
    protocolFunctions.email = {
        'workOrder.create': emailModule.sendWorkOrderCreateEmailNotification,
        'workOrder.update': emailModule.sendWorkOrderUpdateEmailNotification
    };
}
if (enabledProtocols.includes('msTeams')) {
    const msTeamsModule = await import('./msTeams.protocol.js');
    protocolFunctions.msTeams = {
        'workOrder.create': msTeamsModule.sendWorkOrderCreateMsTeamsNotification,
        'workOrder.update': msTeamsModule.sendWorkOrderUpdateMsTeamsNotification
    };
}
export function getProtocolFunction(protocol, notificationQueueType) {
    // eslint-disable-next-line security/detect-object-injection
    return protocolFunctions[protocol]?.[notificationQueueType];
}
