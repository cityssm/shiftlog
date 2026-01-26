import type { Request, Response } from 'express';
export type DoSetWorkOrderAttachmentThumbnailResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderAttachmentId: number | string;
}>, response: Response<DoSetWorkOrderAttachmentThumbnailResponse>): Promise<void>;
