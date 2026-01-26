import type { Request, Response } from 'express';
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
export type DoUploadWorkOrderAttachmentResponse = {
    success: boolean;
    workOrderAttachmentId?: number;
    message?: string;
};
export default function handler(request: MulterRequest, response: Response<DoUploadWorkOrderAttachmentResponse>): Promise<void>;
export {};
