import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    response.render('timesheets/recovery', {
        headTitle: `${getConfigProperty('timesheets.sectionName')} - Record Recovery`,
        error: request.query.error ?? ''
    });
}
