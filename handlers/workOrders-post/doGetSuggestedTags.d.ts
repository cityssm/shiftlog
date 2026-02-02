import type { Request, Response } from 'express';
interface SuggestedTag {
    tagBackgroundColor?: string;
    tagName: string;
    tagTextColor?: string;
    usageCount: number;
}
export type DoGetSuggestedTagsResponse = {
    success: true;
    suggestedTags: SuggestedTag[];
};
export default function handler(request: Request<{
    workOrderId: string;
}>, response: Response<DoGetSuggestedTagsResponse>): Promise<void>;
export {};
