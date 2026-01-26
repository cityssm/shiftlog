import type { Request, Response } from 'express';
export type DoUpdateAssignedToItemResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoUpdateAssignedToItemResponse>): Promise<void>;
