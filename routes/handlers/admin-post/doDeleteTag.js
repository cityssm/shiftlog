import deleteTag from '../../database/tags/deleteTag.js';
import getTags from '../../database/tags/getTags.js';
export default async function handler(request, response) {
    const tagName = request.body.tagName || '';
    const success = await deleteTag(tagName, request.session.user);
    if (success) {
        const tags = await getTags();
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
