import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    response.render('shifts/search', {
        headTitle: `${getConfigProperty('shifts.sectionName')} - Search`
    });
}
