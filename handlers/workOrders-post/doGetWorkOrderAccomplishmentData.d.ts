import type { Request, Response } from 'express';
import { type WorkOrderAccomplishmentData } from '../../database/workOrders/getWorkOrderAccomplishmentStats.js';
interface RequestBody {
    month: string;
    year: string;
}
export type DoGetWorkOrderAccomplishmentDataResponse = {
    success: true;
    data: WorkOrderAccomplishmentData;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, RequestBody>, response: Response<DoGetWorkOrderAccomplishmentDataResponse>): Promise<void>;
export {};
