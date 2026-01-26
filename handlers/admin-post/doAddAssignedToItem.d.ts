import type { Request, Response } from 'express';
export type DoAddAssignedToItemResponse = {
    success: true;
    assignedToId: number;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request, response: Response<DoAddAssignedToItemResponse>): Promise<void>;
