import getTags from '../../database/tags/getTags.js';
export default async function handler(_request, response) {
    const tags = await getTags();
    response.render('admin/tags', {
        headTitle: 'Tag Management',
        section: 'admin',
        tags
    });
}
