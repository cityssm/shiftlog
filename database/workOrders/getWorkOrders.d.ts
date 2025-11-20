import type { WorkOrder } from '../../types/record.types.js';
export interface GetWorkOrdersFilters {
    workOrderNumber?: string;
    workOrderTypeDataListItemId?: number | string;
    workOrderStatusDataListItemId?: number | string;
    requestorName?: string;
}
export interface GetWorkOrdersOptions {
    limit: number | string;
    offset: number | string;
}
export default function getWorkOrders(filters: GetWorkOrdersFilters, options: GetWorkOrdersOptions, user?: User): Promise<{
    workOrders: WorkOrder[];
    totalCount: number;
}>;
