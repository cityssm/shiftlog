import type { Request, Response } from 'express';
export type DoMarkEquipmentAsEnteredResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    timesheetId: number | string;
}>, response: Response<DoMarkEquipmentAsEnteredResponse>): Promise<void>;
