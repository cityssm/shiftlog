import type { NotificationFunction, NotificationQueueType } from '../types.js';
export type Protocol = 'email' | 'msTeams' | 'ntfy';
export declare function getProtocolFunction(protocol: Protocol, notificationQueueType: NotificationQueueType): NotificationFunction | undefined;
