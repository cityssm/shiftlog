import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    equipmentNumber: string;
}>, response: Response): Promise<void>;
