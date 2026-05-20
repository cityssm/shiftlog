import updateTagAlias from '../../database/tags/updateTagAlias.js';
import { getCachedTagAliases } from '../../helpers/cache/tagAliases.cache.js';
export default async function handler(request, response) {
    const oldTagNameAlias = request.body.oldTagNameAlias ?? '';
    const tagNameAlias = request.body.tagNameAlias ?? '';
    const tagName = request.body.tagName ?? '';
    const success = await updateTagAlias({ oldTagNameAlias, tagNameAlias, tagName }, request.session.user);
    if (success) {
        const tagAliases = await getCachedTagAliases();
        response.json({
            success: true,
            tagAliases
        });
    }
    else {
        response.json({
            success: false,
            message: 'Tag alias could not be updated.'
        });
    }
}
