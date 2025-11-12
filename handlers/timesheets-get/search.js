import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    response.render('timesheets/search', {
        headTitle: `${getConfigProperty('timesheets.sectionName')} - Search`
    });
}
