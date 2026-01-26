import type { Request, Response } from 'express';
import type { AdhocTask } from '../../types/record.types.js';
export type DoDeleteShiftAdhocTaskResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    shiftAdhocTasks: AdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
    shiftId: number | string;
    adhocTaskId: number | string;
    deleteTask: boolean;
}>, response: Response<DoDeleteShiftAdhocTaskResponse>): Promise<void>;
