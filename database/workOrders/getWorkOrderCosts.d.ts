import type { WorkOrderCost } from '../../types/record.types.js';
export default function getWorkOrderCosts(workOrderId: number | string): Promise<WorkOrderCost[]>;
