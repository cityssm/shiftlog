import type { Request, Response } from 'express';
import getLocations from '../../database/locations/getLocations.js';
export type DoUpdateLocationResponse = {
    success: true;
    locations: Awaited<ReturnType<typeof getLocations>>;
} | {
    success: false;
    message: string;
};
export default function handler(request: Request, response: Response<DoUpdateLocationResponse>): Promise<void>;
