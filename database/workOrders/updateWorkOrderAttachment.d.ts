export interface UpdateWorkOrderAttachmentForm {
    attachmentDescription: string;
    workOrderAttachmentId: number | string;
}
export default function updateWorkOrderAttachment(updateWorkOrderAttachmentForm: UpdateWorkOrderAttachmentForm, userName: string): Promise<boolean>;
