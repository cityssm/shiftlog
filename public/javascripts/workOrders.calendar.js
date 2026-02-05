(() => {
    const shiftLog = exports.shiftLog;
    const calendarContainerElement = document.querySelector('#container--calendar');
    const monthTitleElement = document.querySelector('#calendar--monthTitle');
    const previousMonthButtonElement = document.querySelector('#btn--previousMonth');
    const nextMonthButtonElement = document.querySelector('#btn--nextMonth');
    const assignedToSelect = document.querySelector('#calendar--assignedToId');
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
     * Note:
     * Use cityssm.escapeHTML(text) for HTML escaping to ensure consistent behavior
     * across the application.
     */
    function updateMonthTitle() {
        monthTitleElement.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
    }
    /**
     * Get the left icon HTML for an event type (work order icon or check icon)
     */
    function getEventTypeLeftIcon(eventType) {
        if (eventType.startsWith('milestone')) {
            return '<i class="fa-solid fa-check"></i>';
        }
        return `<i class="fa-solid ${shiftLog.workOrdersIconClass}"></i>`;
    }
    /**
     * Get the status icon HTML for an event type (play/exclamation-triangle/stop)
     */
    function getEventTypeStatusIcon(eventType) {
        switch (eventType) {
            case 'milestoneComplete':
            case 'workOrderClose': {
                return '<i class="fa-solid fa-stop"></i>';
            }
            case 'milestoneDue':
            case 'workOrderDue': {
                return '<i class="fa-solid fa-exclamation-triangle"></i>';
            }
            case 'workOrderOpen': {
                return '<i class="fa-solid fa-play"></i>';
            }
            default: {
                return '';
            }
        }
    }
    function getEventTypeClass(eventType) {
        switch (eventType) {
            case 'milestoneComplete':
            case 'workOrderClose': {
                return 'is-info';
            }
            case 'milestoneDue':
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
    function getEventStatus(event, currentDate) {
        let statusText;
        let rightTagClass;
        function getOpenOrOverdueStatus(dueDateTime, currentDate) {
            let statusText = 'Open';
            let rightTagClass;
            if (dueDateTime !== null && dueDateTime !== undefined) {
                const dueDate = new Date(dueDateTime);
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < currentDate) {
                    statusText = 'Overdue';
                    rightTagClass = 'is-light is-danger';
                }
                else {
                    rightTagClass = 'is-light is-success';
                }
            }
            else {
                rightTagClass = 'is-light is-success';
            }
            return {
                statusText,
                rightTagClass
            };
        }
        if (event.eventType.startsWith('workOrder')) {
            // Work order logic
            if (event.workOrderCloseDateTime === null) {
                // Work order is open
                ({ statusText, rightTagClass } = getOpenOrOverdueStatus(event.workOrderDueDateTime, currentDate));
            }
            else {
                statusText = 'Closed';
                rightTagClass = 'is-light';
            }
        }
        else if (event.milestoneCompleteDateTime === null) {
            // Non-work-order event that is not yet complete
            ({ statusText, rightTagClass } = getOpenOrOverdueStatus(event.milestoneDueDateTime, currentDate));
        }
        else {
            // Non-work-order event that is complete
            statusText = 'Closed';
            rightTagClass = 'is-light';
        }
        return { statusText, rightTagClass };
    }
    function renderCalendar(events) {
        // Group events by date
        const eventsByDate = new Map();
        for (const event of events) {
            if (!event.eventDate) {
                // Skip events without an eventDate
                continue;
            }
            const eventDate = new Date(event.eventDate);
            if (Number.isNaN(eventDate.getTime())) {
                // Skip events with invalid dates
                continue;
            }
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
        const calendarElement = document.createElement('table');
        calendarElement.className = 'table is-fullwidth is-bordered';
        calendarElement.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';
        // Header row
        for (const dayName of dayNames) {
            calendarElement
                .querySelector('thead tr')
                ?.insertAdjacentHTML('beforeend', `<th class="has-text-centered">${cityssm.escapeHTML(dayName)}</th>`);
        }
        let dayCounter = 1;
        let calendarDay = 1 - startingDayOfWeek;
        // Generate weeks
        while (dayCounter <= daysInMonth) {
            const weekRowElement = document.createElement('tr');
            // Generate days in week
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
                if (calendarDay < 1 || calendarDay > daysInMonth) {
                    const emptyCell = document.createElement('td');
                    emptyCell.className = 'has-background-light';
                    weekRowElement.append(emptyCell);
                }
                else {
                    const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(calendarDay).padStart(2, '0')}`;
                    const dayEvents = eventsByDate.get(dateKey) ?? [];
                    const dayCell = document.createElement('td');
                    dayCell.className = 'is-vcentered';
                    dayCell.style.verticalAlign = 'top';
                    dayCell.style.minHeight = '120px';
                    dayCell.innerHTML = `<div class="has-text-weight-bold mb-2">${cityssm.escapeHTML(String(calendarDay))}</div>`;
                    if (dayEvents.length > 0) {
                        // Create current date once for all events in this day
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0); // Reset to midnight for date comparison
                        for (const event of dayEvents) {
                            const eventClass = getEventTypeClass(event.eventType);
                            const leftIcon = getEventTypeLeftIcon(event.eventType);
                            const statusIcon = getEventTypeStatusIcon(event.eventType);
                            const { statusText, rightTagClass } = getEventStatus(event, currentDate);
                            const titleWithStatus = event.milestoneTitle
                                ? `${event.workOrderNumber} - ${event.milestoneTitle} (${statusText})`
                                : `${event.workOrderNumber} (${statusText})`;
                            // Create a tag with addons: left side has icons, right side has work order number
                            const safeHref = encodeURI(shiftLog.buildWorkOrderURL(event.workOrderId));
                            // eslint-disable-next-line no-unsanitized/method -- URL is encoded, user content is escaped
                            dayCell.insertAdjacentHTML('beforeend', 
                            /* html */ `
                  <div class="tags has-addons mb-1">
                    <a class="tag ${eventClass}" href="${safeHref}" title="${cityssm.escapeHTML(titleWithStatus)}">
                      <span class="icon is-small">${leftIcon}</span>
                      <span class="icon is-small">${statusIcon}</span>
                    </a>
                    <a class="tag ${rightTagClass}" href="${safeHref}" title="${cityssm.escapeHTML(titleWithStatus)}">
                      ${cityssm.escapeHTML(event.workOrderNumber)}
                    </a>
                  </div>
                `);
                        }
                    }
                    weekRowElement.append(dayCell);
                    if (calendarDay >= 1 && calendarDay <= daysInMonth) {
                        dayCounter += 1;
                    }
                }
                calendarDay += 1;
            }
            calendarElement.querySelector('tbody')?.append(weekRowElement);
        }
        calendarContainerElement.replaceChildren(calendarElement);
    }
    function loadCalendar() {
        updateMonthTitle();
        cityssm.postJSON(`${shiftLog.urlPrefix}/${shiftLog.workOrdersRouter}/doGetCalendarEvents`, {
            month: currentMonth,
            year: currentYear,
            assignedToId: assignedToSelect.value,
            showCloseDates: showCloseDatesCheckbox.checked,
            showDueDates: showDueDatesCheckbox.checked,
            showMilestoneCompleteDates: showMilestoneCompleteDatesCheckbox.checked,
            showMilestoneDueDates: showMilestoneDueDatesCheckbox.checked,
            showOpenDates: showOpenDatesCheckbox.checked
        }, (responseJSON) => {
            renderCalendar(responseJSON.events);
        });
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
            currentYear += 1;
        }
        else {
            currentMonth += 1;
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
