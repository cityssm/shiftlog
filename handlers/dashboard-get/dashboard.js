export default function handler(request, response) {
    response.render('dashboard/dashboard', {
        headTitle: 'Dashboard'
    });
}
