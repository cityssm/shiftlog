import type { Request, Response } from 'express';
import getTags from '../../database/tags/getTags.js';
export type DoDeleteTagResponse = {
    success: true;
    tags: Awaited<ReturnType<typeof getTags>>;
} | {
    success: false;
    message: string;
};
export default function handler(request: Request, response: Response<DoDeleteTagResponse>): Promise<void>;
