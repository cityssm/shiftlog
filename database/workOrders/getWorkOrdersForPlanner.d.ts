import type { WorkOrder } from '../../types/record.types.js';
export interface GetWorkOrdersForPlannerFilters {
    assignedToId?: number | string;
    includeUnassigned?: boolean;
    workOrderTypeId?: number | string;
    workOrderPriorityDataListItemId?: number | string;
    workOrderStatusDataListItemId?: number | string;
    dateFilter?: '' | 'dueInDays' | 'milestonesDueInDays' | 'milestonesOverdue' | 'noUpdatesForDays' | 'openForDays' | 'overdue';
    daysThreshold?: number | string;
}
export interface GetWorkOrdersForPlannerOptions {
    limit: number | string;
    offset: number | string;
}
export default function getWorkOrdersForPlanner(filters: GetWorkOrdersForPlannerFilters, options: GetWorkOrdersForPlannerOptions, user?: User): Promise<{
    workOrders: WorkOrder[];
    totalCount: number;
}>;
