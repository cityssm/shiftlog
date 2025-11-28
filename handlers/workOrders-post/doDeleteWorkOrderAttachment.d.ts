import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderAttachmentId: number | string;
}>, response: Response): Promise<void>;
