import getWorkOrderAccomplishmentStats from '../../database/workOrders/getWorkOrderAccomplishmentStats.js';
export default async function handler(request, response) {
    const { month, year } = request.body;
    try {
        const yearNumber = Number.parseInt(year, 10);
        const monthNumber = Number.parseInt(month, 10);
        let startDate;
        let endDate;
        let filterType;
        if (monthNumber > 0) {
            // Specific month filter
            startDate = new Date(yearNumber, monthNumber - 1, 1);
            endDate = new Date(yearNumber, monthNumber, 0); // Last day of month
            filterType = 'month';
        }
        else {
            // Year filter (month = 0 means "All")
            startDate = new Date(yearNumber, 0, 1);
            endDate = new Date(yearNumber, 11, 31);
            filterType = 'year';
        }
        const data = await getWorkOrderAccomplishmentStats(startDate, endDate, filterType, request.session.user);
        response.json({
            data,
            success: true
        });
    }
    catch {
        response.json({
            errorMessage: 'Error fetching accomplishment data',
            success: false
        });
    }
}
