import type { WorkOrderAttachment } from '../../types/record.types.js';
export default function getWorkOrderAttachment(workOrderAttachmentId: number | string): Promise<WorkOrderAttachment | undefined>;
