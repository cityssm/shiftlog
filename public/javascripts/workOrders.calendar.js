(() => {
    const shiftLog = exports.shiftLog;
    const filtersFormElement = document.querySelector('#form--calendarFilters');
    const calendarContainerElement = document.querySelector('#container--calendar');
    const monthTitleElement = document.querySelector('#calendar--monthTitle');
    const previousMonthButtonElement = document.querySelector('#btn--previousMonth');
    const nextMonthButtonElement = document.querySelector('#btn--nextMonth');
    const assignedToSelect = document.querySelector('#calendar--assignedToDataListItemId');
    const showOpenDatesCheckbox = document.querySelector('#calendar--showOpenDates');
    const showDueDatesCheckbox = document.querySelector('#calendar--showDueDates');
    const showCloseDatesCheckbox = document.querySelector('#calendar--showCloseDates');
    const showMilestoneDueDatesCheckbox = document.querySelector('#calendar--showMilestoneDueDates');
    const showMilestoneCompleteDatesCheckbox = document.querySelector('#calendar--showMilestoneCompleteDates');
    // Current date state
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth() + 1; // 1-12
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    /**
     * Escapes HTML special characters to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    function updateMonthTitle() {
        monthTitleElement.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
    }
    function getEventTypeLabel(eventType) {
        switch (eventType) {
            case 'milestoneComplete': {
                return 'M Done';
            }
            case 'milestoneDue': {
                return 'M Due';
            }
            case 'workOrderClose': {
                return 'Close';
            }
            case 'workOrderDue': {
                return 'Due';
            }
            case 'workOrderOpen': {
                return 'Open';
            }
            default: {
                return eventType;
            }
        }
    }
    function getEventTypeClass(eventType) {
        switch (eventType) {
            case 'milestoneComplete': {
                return 'is-primary';
            }
            case 'milestoneDue': {
                return 'is-link';
            }
            case 'workOrderClose': {
                return 'is-info';
            }
            case 'workOrderDue': {
                return 'is-warning';
            }
            case 'workOrderOpen': {
                return 'is-success';
            }
            default: {
                return '';
            }
        }
    }
    function renderCalendar(events) {
        // Group events by date
        const eventsByDate = new Map();
        for (const event of events) {
            const eventDate = new Date(event.eventDate);
            const dateKey = eventDate.toISOString().split('T')[0];
            if (!eventsByDate.has(dateKey)) {
                eventsByDate.set(dateKey, []);
            }
            eventsByDate.get(dateKey)?.push(event);
        }
        // Calculate calendar grid
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        // Build calendar HTML
        let calendarHTML = '<table class="table is-fullwidth is-bordered">';
        // Header row
        calendarHTML += '<thead><tr>';
        for (const dayName of dayNames) {
            calendarHTML += `<th class="has-text-centered">${dayName}</th>`;
        }
        calendarHTML += '</tr></thead>';
        // Calendar body
        calendarHTML += '<tbody>';
        let dayCounter = 1;
        let calendarDay = 1 - startingDayOfWeek;
        // Generate weeks
        while (dayCounter <= daysInMonth) {
            calendarHTML += '<tr>';
            // Generate days in week
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
                if (calendarDay < 1 || calendarDay > daysInMonth) {
                    calendarHTML += '<td class="has-background-light"></td>';
                }
                else {
                    const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(calendarDay).padStart(2, '0')}`;
                    const dayEvents = eventsByDate.get(dateKey) ?? [];
                    calendarHTML +=
                        '<td class="is-vcentered" style="vertical-align: top; min-height: 120px;">';
                    calendarHTML += `<div class="has-text-weight-bold mb-2">${calendarDay}</div>`;
                    if (dayEvents.length > 0) {
                        calendarHTML += '<div class="tags">';
                        for (const event of dayEvents) {
                            const eventLabel = getEventTypeLabel(event.eventType);
                            const eventClass = getEventTypeClass(event.eventType);
                            const title = event.milestoneTitle
                                ? `${event.workOrderNumber} - ${event.milestoneTitle}`
                                : event.workOrderNumber;
                            calendarHTML += `<a href="${shiftLog.buildWorkOrderURL(event.workOrderId)}" class="tag ${eventClass}" title="${escapeHtml(title)}">${escapeHtml(eventLabel)}</a>`;
                        }
                        calendarHTML += '</div>';
                    }
                    calendarHTML += '</td>';
                    if (calendarDay >= 1 && calendarDay <= daysInMonth) {
                        dayCounter += 1;
                    }
                }
                calendarDay += 1;
            }
            calendarHTML += '</tr>';
        }
        calendarHTML += '</tbody></table>';
        // eslint-disable-next-line no-unsanitized/property
        calendarContainerElement.innerHTML = calendarHTML;
    }
    async function loadCalendar() {
        updateMonthTitle();
        const formData = new FormData();
        formData.append('year', currentYear.toString());
        formData.append('month', currentMonth.toString());
        formData.append('assignedToDataListItemId', assignedToSelect.value);
        formData.append('showOpenDates', showOpenDatesCheckbox.checked.toString());
        formData.append('showDueDates', showDueDatesCheckbox.checked.toString());
        formData.append('showCloseDates', showCloseDatesCheckbox.checked.toString());
        formData.append('showMilestoneDueDates', showMilestoneDueDatesCheckbox.checked.toString());
        formData.append('showMilestoneCompleteDates', showMilestoneCompleteDatesCheckbox.checked.toString());
        try {
            const response = await fetch(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doGetCalendarEvents`, {
                method: 'POST',
                body: formData
            });
            const data = (await response.json());
            if (data.success) {
                renderCalendar(data.events);
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error',
                    message: 'Failed to load calendar events.'
                });
            }
        }
        catch {
            bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error',
                message: 'An error occurred while loading the calendar.'
            });
        }
    }
    // Event listeners
    previousMonthButtonElement.addEventListener('click', () => {
        if (currentMonth === 1) {
            currentMonth = 12;
            currentYear -= 1;
        }
        else {
            currentMonth -= 1;
        }
        loadCalendar();
    });
    nextMonthButtonElement.addEventListener('click', () => {
        if (currentMonth === 12) {
            currentMonth = 1;
            currentYear++;
        }
        else {
            currentMonth++;
        }
        loadCalendar();
    });
    assignedToSelect.addEventListener('change', () => {
        loadCalendar();
    });
    showOpenDatesCheckbox.addEventListener('change', () => {
        loadCalendar();
    });
    showDueDatesCheckbox.addEventListener('change', () => {
        loadCalendar();
    });
    showCloseDatesCheckbox.addEventListener('change', () => {
        loadCalendar();
    });
    showMilestoneDueDatesCheckbox.addEventListener('change', () => {
        loadCalendar();
    });
    showMilestoneCompleteDatesCheckbox.addEventListener('change', () => {
        loadCalendar();
    });
    // Initial load
    loadCalendar();
})();
