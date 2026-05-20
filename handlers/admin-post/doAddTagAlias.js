import addTagAlias from '../../database/tags/addTagAlias.js';
import getTagAliases from '../../database/tags/getTagAliases.js';
export default async function handler(request, response) {
    const tagNameAlias = request.body.tagNameAlias ?? '';
    const tagName = request.body.tagName ?? '';
    const success = await addTagAlias({ tagNameAlias, tagName }, request.session.user);
    if (success) {
        const tagAliases = await getTagAliases();
        response.json({
            success: true,
            tagAliases
        });
    }
    else {
        response.json({
            success: false,
            message: 'Tag alias could not be added. Alias may already exist.'
        });
    }
}
