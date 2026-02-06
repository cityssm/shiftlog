import type { Request, Response } from 'express';
export default function handler(request: Request<object, object, {
    dataListKey: string;
}>, response: Response): Promise<void>;
