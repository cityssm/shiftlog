import type { Request, Response } from 'express';
import type { WorkOrderTag } from '../../types/record.types.js';
interface DeleteWorkOrderTagForm {
    workOrderId: number;
    tagName: string;
}
export type DoDeleteWorkOrderTagResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    tags: WorkOrderTag[];
};
export default function handler(request: Request<unknown, unknown, DeleteWorkOrderTagForm>, response: Response<DoDeleteWorkOrderTagResponse>): Promise<void>;
export {};
