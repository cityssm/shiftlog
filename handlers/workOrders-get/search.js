import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    response.render('workOrders/search', {
        headTitle: `${getConfigProperty('workOrders.sectionName')} - Search`
    });
}
