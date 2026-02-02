interface SuggestedTag {
    tagName: string;
    tagBackgroundColor?: string;
    tagTextColor?: string;
    usageCount: number;
}
export default function getSuggestedTags(workOrderId: number | string, limit?: number): Promise<SuggestedTag[]>;
export {};
