/**
 * Permanently deletes records that have been marked as deleted for a minimum number of days
 * and have no foreign key relationships to active records.
 * @returns An object containing the success status, count of deleted records, and any errors encountered.
 */
export default function permanentlyDeleteRecords(): Promise<{
    success: boolean;
    deletedCount: number;
    errors: string[];
}>;
