import getTags from '../../database/tags/getTags.js';
import updateTag from '../../database/tags/updateTag.js';
export default async function handler(request, response) {
    const tagName = request.body.tagName || '';
    let tagBackgroundColor = request.body.tagBackgroundColor || '000000';
    let tagTextColor = request.body.tagTextColor || 'FFFFFF';
    // Remove # prefix if present
    if (tagBackgroundColor.startsWith('#')) {
        tagBackgroundColor = tagBackgroundColor.substring(1);
    }
    if (tagTextColor.startsWith('#')) {
        tagTextColor = tagTextColor.substring(1);
    }
    const success = await updateTag({ tagName, tagBackgroundColor, tagTextColor }, request.session.user);
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
            message: 'Tag could not be updated.'
        });
    }
}
