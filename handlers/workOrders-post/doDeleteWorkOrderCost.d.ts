import type { Request, Response } from 'express';
export interface DeleteWorkOrderCostForm {
    workOrderCostId: number | string;
}
export type DoDeleteWorkOrderCostResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, DeleteWorkOrderCostForm>, response: Response<DoDeleteWorkOrderCostResponse>): Promise<void>;
