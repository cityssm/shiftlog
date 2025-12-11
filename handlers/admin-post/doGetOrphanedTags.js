import getOrphanedTags from '../../database/tags/getOrphanedTags.js';
export default async function handler(_request, response) {
    const orphanedTags = await getOrphanedTags();
    response.json({
        success: true,
        orphanedTags
    });
}
