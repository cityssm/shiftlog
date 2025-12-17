import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    crewId: string;
    crewName: string;
    userGroupId: string;
}>, response: Response): Promise<void>;
