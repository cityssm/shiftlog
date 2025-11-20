export default function handler(request, response) {
    response.render('dashboard/reports', {
        headTitle: 'Reports'
    });
}
