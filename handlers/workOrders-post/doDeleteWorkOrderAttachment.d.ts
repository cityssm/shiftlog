import type { Request, Response } from 'express';
export type DoDeleteWorkOrderAttachmentResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderAttachmentId: number | string;
}>, response: Response<DoDeleteWorkOrderAttachmentResponse>): Promise<void>;
