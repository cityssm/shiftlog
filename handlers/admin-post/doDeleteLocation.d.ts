import type { Request, Response } from 'express';
import type { Location } from '../../types/record.types.js';
export type DoDeleteLocationResponse = {
    success: false;
    message: string;
} | {
    success: true;
    locations: Location[];
};
export default function handler(request: Request, response: Response<DoDeleteLocationResponse>): Promise<void>;
