import type { Request, Response } from 'express';
export type DoReorderAssignedToItemsResponse = {
    success: boolean;
};
export default function handler(request: Request, response: Response<DoReorderAssignedToItemsResponse>): Promise<void>;
