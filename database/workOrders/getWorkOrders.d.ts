import type { WorkOrder } from '../../types/record.types.js';
export interface GetWorkOrdersFilters {
    assignedToDataListItemId?: number | string;
    openClosedFilter?: '' | 'closed' | 'open' | 'overdue';
    searchString?: string;
    requestor?: string;
    requestorName?: string;
    workOrderNumber?: string;
    workOrderStatusDataListItemId?: number | string;
    workOrderTypeId?: number | string;
}
export interface GetWorkOrdersOptions {
    limit: number | string;
    offset: number | string;
    includeMoreInfoFormData?: boolean;
}
export default function getWorkOrders(filters: GetWorkOrdersFilters, options: GetWorkOrdersOptions, user?: User): Promise<{
    workOrders: WorkOrder[];
    totalCount: number;
}>;
