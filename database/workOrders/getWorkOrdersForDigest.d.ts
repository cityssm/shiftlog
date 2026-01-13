import type { WorkOrder, WorkOrderMilestone } from '../../types/record.types.js';
export interface WorkOrderDigestItem extends WorkOrder {
    isOverdue: boolean;
    isNew: boolean;
}
export interface WorkOrderMilestoneDigestItem extends WorkOrderMilestone {
    workOrderNumber: string;
    isOverdue: boolean;
    isNew: boolean;
}
export declare function getWorkOrdersForDigest(assignedToId: number | string): Promise<{
    workOrders: WorkOrderDigestItem[];
    milestones: WorkOrderMilestoneDigestItem[];
}>;
