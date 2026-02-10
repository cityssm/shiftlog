import type { Request, Response } from 'express';
export type DoDeleteAssignedToItemResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoDeleteAssignedToItemResponse>): Promise<void>;
