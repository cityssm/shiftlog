import type { WorkOrder } from '../../types/record.types.js';
export interface GetWorkOrdersForPlannerFilters {
    assignedToDataListItemId?: number | string;
    includeUnassigned?: boolean;
    workOrderTypeId?: number | string;
    workOrderStatusDataListItemId?: number | string;
    dateFilter?: '' | 'overdue' | 'openForDays' | 'dueInDays' | 'milestonesOverdue' | 'milestonesDueInDays';
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
