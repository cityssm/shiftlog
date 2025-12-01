import type { WorkOrder } from '../../types/record.types.js';
export default function getDeletedWorkOrders(user?: User): Promise<WorkOrder[]>;
