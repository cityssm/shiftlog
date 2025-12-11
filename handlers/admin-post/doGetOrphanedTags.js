import getOrphanedTags from '../../database/tags/getOrphanedTags.js';
export default async function handler(_request, response) {
    try {
        const orphanedTags = await getOrphanedTags();
        response.json({
            success: true,
            orphanedTags
        });
    }
    catch {
        response.json({
            success: false,
            message: 'Error retrieving orphaned tags.'
        });
    }
}
