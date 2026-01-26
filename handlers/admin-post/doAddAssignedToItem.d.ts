import type { Request, Response } from 'express';
export type DoAddAssignedToItemResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    assignedToId: number;
};
export default function handler(request: Request, response: Response<DoAddAssignedToItemResponse>): Promise<void>;
