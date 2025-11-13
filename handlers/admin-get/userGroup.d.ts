import type { Request, Response } from 'express';
export default function handler(request: Request<{
    userGroupId: string;
}>, response: Response): Promise<void>;
