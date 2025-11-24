import type { WorkOrder } from '../../types/record.types.js';
export default function getOverdueWorkOrders(limit: number, user?: User): Promise<WorkOrder[]>;
