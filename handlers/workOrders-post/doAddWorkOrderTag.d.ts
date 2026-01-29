import type { Request, Response } from 'express';
import type { WorkOrderTag } from '../../types/record.types.js';
interface AddWorkOrderTagForm {
    workOrderId: number;
    tagName: string;
}
export type DoAddWorkOrderTagResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    tags: WorkOrderTag[];
};
export default function handler(request: Request<unknown, unknown, AddWorkOrderTagForm>, response: Response<DoAddWorkOrderTagResponse>): Promise<void>;
export {};
