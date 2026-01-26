import type { Request, Response } from 'express';
export type DoDeleteWorkOrderMilestoneResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneId: number | string;
}>, response: Response<DoDeleteWorkOrderMilestoneResponse>): Promise<void>;
