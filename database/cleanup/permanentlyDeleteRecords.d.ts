/**
 * Permanently deletes records that have been marked as deleted for a minimum number of days
 * and have no foreign key relationships to active records.
 */
export default function permanentlyDeleteRecords(): Promise<{
    success: boolean;
    deletedCount: number;
    errors: string[];
}>;
