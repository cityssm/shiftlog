import type { NotificationConfiguration, WorkOrder } from '../../../types/record.types.js';
export declare function getWorkOrderToSend(workOrderId: number | string, notificationConfiguration: NotificationConfiguration): Promise<{
    success: false;
    errorMessage: string;
} | {
    success: true;
    workOrder: WorkOrder;
} | undefined>;
