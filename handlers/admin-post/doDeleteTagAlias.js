import deleteTagAlias from '../../database/tags/deleteTagAlias.js';
import { getCachedTagAliases } from '../../helpers/cache/tagAliases.cache.js';
export default async function handler(request, response) {
    const tagNameAlias = request.body.tagNameAlias ?? '';
    const success = await deleteTagAlias(tagNameAlias, request.session.user);
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
            message: 'Tag alias could not be deleted.'
        });
    }
}
