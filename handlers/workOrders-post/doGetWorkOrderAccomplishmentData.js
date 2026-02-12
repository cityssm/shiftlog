import getWorkOrderAccomplishmentStats from '../../database/workOrders/getWorkOrderAccomplishmentStats.js';
export default async function handler(request, response) {
    const { filterType, year, month } = request.body;
    try {
        const yearNumber = Number.parseInt(year, 10);
        let startDate;
        let endDate;
        if (filterType === 'month' && month !== undefined) {
            const monthNumber = Number.parseInt(month, 10);
            startDate = new Date(yearNumber, monthNumber - 1, 1);
            endDate = new Date(yearNumber, monthNumber, 0); // Last day of month
        }
        else {
            // Year filter
            startDate = new Date(yearNumber, 0, 1);
            endDate = new Date(yearNumber, 11, 31);
        }
        const data = await getWorkOrderAccomplishmentStats(startDate, endDate, filterType, request.session.user);
        response.json({
            success: true,
            data
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: 'Error fetching accomplishment data'
        });
    }
}
