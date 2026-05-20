import updateTag from '../../database/tags/updateTag.js';
import { getCachedTags } from '../../helpers/cache/tags.cache.js';
export default async function handler(request, response) {
    const tagName = request.body.tagName ?? '';
    let tagBackgroundColor = request.body.tagBackgroundColor ?? '000000';
    let tagTextColor = request.body.tagTextColor ?? 'FFFFFF';
    if (tagBackgroundColor.startsWith('#')) {
        tagBackgroundColor = tagBackgroundColor.slice(1);
    }
    if (tagTextColor.startsWith('#')) {
        tagTextColor = tagTextColor.slice(1);
    }
    const success = await updateTag({ tagName, tagBackgroundColor, tagTextColor }, request.session.user);
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
            message: 'Tag could not be updated.'
        });
    }
}
