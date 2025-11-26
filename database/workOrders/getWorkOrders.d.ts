import type { WorkOrder } from '../../types/record.types.js';
export interface GetWorkOrdersFilters {
    openClosedFilter?: '' | 'closed' | 'open' | 'overdue';
    requestor?: string;
    requestorName?: string;
    workOrderNumber?: string;
    workOrderStatusDataListItemId?: number | string;
    workOrderTypeDataListItemId?: number | string;
}
export interface GetWorkOrdersOptions {
    limit: number | string;
    offset: number | string;
}
export default function getWorkOrders(filters: GetWorkOrdersFilters, options: GetWorkOrdersOptions, user?: User): Promise<{
    workOrders: WorkOrder[];
    totalCount: number;
}>;
