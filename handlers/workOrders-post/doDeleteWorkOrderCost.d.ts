import type { Request, Response } from 'express';
export interface DeleteWorkOrderCostForm {
    workOrderCostId: number | string;
}
export default function handler(request: Request<unknown, unknown, DeleteWorkOrderCostForm>, response: Response): Promise<void>;
