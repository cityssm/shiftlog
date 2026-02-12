import type { Request, Response } from 'express';
interface RequestBody {
    filterType: 'month' | 'year';
    month?: string;
    year: string;
}
export default function handler(request: Request<unknown, unknown, RequestBody>, response: Response): Promise<void>;
export {};
