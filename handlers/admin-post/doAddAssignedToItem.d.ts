import type { Request, Response } from 'express';
import { type CreateAssignedToForm } from '../../database/assignedTo/createAssignedToItem.js';
export type DoAddAssignedToItemResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    assignedToId: number;
};
export default function handler(request: Request<unknown, unknown, CreateAssignedToForm>, response: Response<DoAddAssignedToItemResponse>): Promise<void>;
