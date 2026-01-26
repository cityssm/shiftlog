import type { Request, Response } from 'express';
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
interface ReorderWorkOrderTypesForm {
    workOrderTypeIds: Array<number | string>;
}
export type DoReorderWorkOrderTypesResponse = {
    success: true;
    workOrderTypes: Awaited<ReturnType<typeof getWorkOrderTypesAdmin>>;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, ReorderWorkOrderTypesForm>, response: Response<DoReorderWorkOrderTypesResponse>): Promise<void>;
export {};
