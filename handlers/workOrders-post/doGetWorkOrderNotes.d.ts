import type { Request, Response } from 'express';
import type { WorkOrderNote } from '../../database/workOrders/getWorkOrderNotes.js';
export type DoGetWorkOrderNotesResponse = {
    success: MediaTrackSupportedConstraints;
    notes: WorkOrderNote[];
};
export default function handler(request: Request<{
    workOrderId: string;
}>, response: Response<DoGetWorkOrderNotesResponse>): Promise<void>;
