import type { Request, Response } from 'express';
import getOrphanedTags from '../../database/tags/getOrphanedTags.js';
export type DoGetOrphanedTagsResponse = {
    success: true;
    orphanedTags: Awaited<ReturnType<typeof getOrphanedTags>>;
} | {
    success: false;
    message: string;
};
export default function handler(_request: Request, response: Response<DoGetOrphanedTagsResponse>): Promise<void>;
