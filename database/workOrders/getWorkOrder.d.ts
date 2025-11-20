import type { WorkOrder } from '../../types/record.types.js';
export default function getWorkOrder(workOrderId: number | string, user?: User): Promise<WorkOrder | undefined>;
