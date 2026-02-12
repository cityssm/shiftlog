export default function handler(request, response) {
    // Initial load with current month as default
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    response.render('workOrders/accomplishments', {
        currentMonth,
        currentYear,
        headTitle: 'Work Order Accomplishments',
        section: 'workOrders'
    });
}
