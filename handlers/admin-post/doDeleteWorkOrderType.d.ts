import type { Request, Response } from 'express';
interface DeleteWorkOrderTypeForm {
    workOrderTypeId: number | string;
}
export default function handler(request: Request<unknown, unknown, DeleteWorkOrderTypeForm>, response: Response): Promise<void>;
export {};
