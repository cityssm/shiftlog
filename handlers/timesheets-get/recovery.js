import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    response.render('timesheets/recovery', {
        headTitle: `${getConfigProperty('timesheets.sectionName')} - Record Recovery`,
        section: 'timesheets',
        error: request.query.error ?? ''
    });
}
