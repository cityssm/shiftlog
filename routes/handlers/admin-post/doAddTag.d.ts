import type { Request, Response } from 'express';
import type { Tag } from '../../types/record.types.js';
export type DoAddTagResponse = {
    success: false;
    message: string;
} | {
    success: true;
    tags: Tag[];
};
export default function handler(request: Request<unknown, unknown, {
    tagName?: string;
    tagBackgroundColor?: string;
    tagTextColor?: string;
}>, response: Response<DoAddTagResponse>): Promise<void>;
