import deleteTag from '../../database/tags/deleteTag.js';
import { getCachedTags } from '../../helpers/cache/tags.cache.js';
export default async function handler(request, response) {
    const tagName = request.body.tagName || '';
    const success = await deleteTag(tagName, request.session.user);
    if (success) {
        const tags = await getCachedTags();
        response.json({
            success: true,
            tags
        });
    }
    else {
        response.json({
            success: false,
            message: 'Tag could not be deleted.'
        });
    }
}
