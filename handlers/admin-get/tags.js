import { getCachedTags } from '../../helpers/cache/tags.cache.js';
export default async function handler(_request, response) {
    const tags = await getCachedTags();
    response.render('admin/tags', {
        headTitle: 'Tag Management',
        section: 'admin',
        tags
    });
}
