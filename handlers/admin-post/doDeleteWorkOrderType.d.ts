import type { Request, Response } from 'express';
import getWorkOrderTypesAdmin from '../../database/workOrderTypes/getWorkOrderTypesAdmin.js';
interface DeleteWorkOrderTypeForm {
    workOrderTypeId: number | string;
}
export type DoDeleteWorkOrderTypeResponse = {
    success: true;
    workOrderTypes: Awaited<ReturnType<typeof getWorkOrderTypesAdmin>>;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, DeleteWorkOrderTypeForm>, response: Response<DoDeleteWorkOrderTypeResponse>): Promise<void>;
export {};
