import type { Request, Response } from 'express';
interface DeleteWorkOrderTagForm {
    workOrderId: number;
    tagName: string;
}
export default function handler(request: Request<unknown, unknown, DeleteWorkOrderTagForm>, response: Response): Promise<void>;
export {};
