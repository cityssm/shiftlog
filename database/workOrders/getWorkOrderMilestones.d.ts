import type { WorkOrderMilestone } from '../../types/record.types.js';
type WorkOrderMilestoneWithAssignedTo = WorkOrderMilestone & {
    assignedToDataListItem?: string;
};
export default function getWorkOrderMilestones(workOrderId: number | string): Promise<WorkOrderMilestoneWithAssignedTo[]>;
export {};
