import type { WorkOrderMilestone } from '../../types/record.types.js';
type WorkOrderMilestoneWithAssignedTo = WorkOrderMilestone & {
    assignedToName?: string;
};
export default function getWorkOrderMilestones(workOrderId: number | string): Promise<WorkOrderMilestoneWithAssignedTo[]>;
export {};
