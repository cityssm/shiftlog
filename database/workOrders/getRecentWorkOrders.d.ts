import type { WorkOrder } from '../../types/record.types.js';
export default function getRecentWorkOrders(limit: number, user?: User): Promise<WorkOrder[]>;
