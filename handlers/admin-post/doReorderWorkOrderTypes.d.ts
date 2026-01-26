import type { Request, Response } from 'express';
import type { WorkOrderType } from '../../types/record.types.js';
interface ReorderWorkOrderTypesForm {
    workOrderTypeIds: Array<number | string>;
}
export type DoReorderWorkOrderTypesResponse = {
    message: string;
    success: false;
} | {
    success: true;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, ReorderWorkOrderTypesForm>, response: Response<DoReorderWorkOrderTypesResponse>): Promise<void>;
export {};
