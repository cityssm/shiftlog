import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    response.render('workOrders/recovery', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} - Record Recovery`,
        error: request.query.error ?? ''
    });
}
