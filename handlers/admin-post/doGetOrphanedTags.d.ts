import type { Request, Response } from 'express';
import { type OrphanedTag } from '../../database/tags/getOrphanedTags.js';
export type DoGetOrphanedTagsResponse = {
    success: false;
    message: string;
} | {
    success: true;
    orphanedTags: OrphanedTag[];
};
export default function handler(_request: Request, response: Response<DoGetOrphanedTagsResponse>): Promise<void>;
