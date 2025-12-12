export default function handler(request, response) {
    response.render('admin/apiAuditLogs', {
        headTitle: 'API Audit Logs'
    });
}
