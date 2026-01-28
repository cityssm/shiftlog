import type { Request, Response } from 'express';
import type { AdhocTask } from '../../types/record.types.js';
export type DoAddShiftAdhocTaskResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    shiftAdhocTasks: AdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    shiftAdhocTaskNote: string;
}>, response: Response<DoAddShiftAdhocTaskResponse>): Promise<void>;
