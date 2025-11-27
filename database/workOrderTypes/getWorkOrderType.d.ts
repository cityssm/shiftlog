import type { WorkOrderType } from '../../types/record.types.js';
export default function getWorkOrderType(workOrderTypeId: number | string, user?: User): Promise<WorkOrderType | undefined>;
