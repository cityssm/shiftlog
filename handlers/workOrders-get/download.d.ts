import type { Request, Response } from 'express';
export default function handler(request: Request<{
    workOrderAttachmentId: string;
}>, response: Response): Promise<void>;
