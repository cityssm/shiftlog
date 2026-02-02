interface SuggestedTag {
    tagBackgroundColor?: string;
    tagName: string;
    tagTextColor?: string;
    usageCount: number;
}
export default function getSuggestedTags(workOrderId: number | string, limit?: number): Promise<SuggestedTag[]>;
export {};
