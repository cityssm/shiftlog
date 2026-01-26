import type { Request, Response } from 'express';
import type { Tag } from '../../types/record.types.js';
export type DoUpdateTagResponse = {
    success: false;
    message: string;
} | {
    success: true;
    tags: Tag[];
};
export default function handler(request: Request, response: Response<DoUpdateTagResponse>): Promise<void>;
