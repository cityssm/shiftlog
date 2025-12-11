interface OrphanedTag {
    tagName: string;
    usageCount: number;
}
/**
 * Get tags that exist in WorkOrderTags but not in the Tags system table.
 * These are ad-hoc tags that have been applied to work orders but don't have
 * system-defined colors.
 */
export default function getOrphanedTags(): Promise<OrphanedTag[]>;
export {};
