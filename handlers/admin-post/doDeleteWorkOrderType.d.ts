import type { Request, Response } from 'express';
import type { WorkOrderType } from '../../types/record.types.js';
interface DeleteWorkOrderTypeForm {
    workOrderTypeId: number | string;
}
export type DoDeleteWorkOrderTypeResponse = {
    message: string;
    success: false;
} | {
    success: true;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, DeleteWorkOrderTypeForm>, response: Response<DoDeleteWorkOrderTypeResponse>): Promise<void>;
export {};
