import type { WorkOrderAttachment } from '../../types/record.types.js';
export default function getWorkOrderAttachments(workOrderId: number | string): Promise<WorkOrderAttachment[]>;
