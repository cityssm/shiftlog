import type { WorkOrder } from '../../types/record.types.js';
export interface GetDeletedWorkOrdersOptions {
    limit: number | string;
    offset: number | string;
}
export default function getDeletedWorkOrders(options: GetDeletedWorkOrdersOptions, user?: User): Promise<{
    workOrders: WorkOrder[];
    totalCount: number;
}>;
