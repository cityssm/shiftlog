import type { Request, Response } from 'express';
import getTags from '../../database/tags/getTags.js';
export type DoUpdateTagResponse = {
    success: true;
    tags: Awaited<ReturnType<typeof getTags>>;
} | {
    success: false;
    message: string;
};
export default function handler(request: Request, response: Response<DoUpdateTagResponse>): Promise<void>;
