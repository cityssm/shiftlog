import type { Request, Response } from 'express';
import type { DateString } from '@cityssm/utils-datetime';
export default function handler(request: Request<unknown, unknown, {
    supervisorEmployeeNumber?: string;
    shiftDateString?: DateString;
}>, response: Response): Promise<void>;
