import { getCachedSettings } from '../../helpers/cache/settings.cache.js';
export default async function handler(_request, response) {
    const settings = await getCachedSettings();
    response.render('admin/settings', {
        headTitle: 'Settings Management',
        settings
    });
}
