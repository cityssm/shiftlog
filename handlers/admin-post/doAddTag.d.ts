import type { Request, Response } from 'express';
import getTags from '../../database/tags/getTags.js';
export type DoAddTagResponse = {
    success: true;
    tags: Awaited<ReturnType<typeof getTags>>;
} | {
    success: false;
    message: string;
};
export default function handler(request: Request, response: Response<DoAddTagResponse>): Promise<void>;
