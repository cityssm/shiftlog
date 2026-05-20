import deleteTagAlias from '../../database/tagAliases/deleteTagAlias.js';
import getTagAliases from '../../database/tagAliases/getTagAliases.js';
export default async function handler(request, response) {
    const tagNameAlias = request.body.tagNameAlias ?? '';
    const success = await deleteTagAlias(tagNameAlias, request.session.user);
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
            message: 'Tag alias could not be deleted.'
        });
    }
}
