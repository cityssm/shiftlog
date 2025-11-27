export default function handler(request, response) {
    const activeTab = request.query.tab ?? '';
    response.render('dashboard/reports', {
        headTitle: 'Reports',
        activeTab
    });
}
