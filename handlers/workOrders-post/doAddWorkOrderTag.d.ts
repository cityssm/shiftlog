import type { Request, Response } from 'express';
interface AddWorkOrderTagForm {
    workOrderId: number;
    tagName: string;
}
export default function handler(request: Request<unknown, unknown, AddWorkOrderTagForm>, response: Response): Promise<void>;
export {};
