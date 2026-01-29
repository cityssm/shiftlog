export interface CreateWorkOrderAttachmentForm {
    workOrderId: number | string;
    attachmentFileName: string;
    attachmentFileType: string;
    attachmentFileSizeInBytes: number;
    attachmentDescription?: string;
    fileSystemPath: string;
}
export default function createWorkOrderAttachment(form: CreateWorkOrderAttachmentForm, userName: string): Promise<number | undefined>;
