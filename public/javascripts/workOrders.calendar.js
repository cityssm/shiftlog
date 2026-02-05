"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var shiftLog = exports.shiftLog;
    var calendarContainerElement = document.querySelector('#container--calendar');
    var monthTitleElement = document.querySelector('#calendar--monthTitle');
    var previousMonthButtonElement = document.querySelector('#btn--previousMonth');
    var nextMonthButtonElement = document.querySelector('#btn--nextMonth');
    var assignedToSelect = document.querySelector('#calendar--assignedToId');
    var showOpenDatesCheckbox = document.querySelector('#calendar--showOpenDates');
    var showDueDatesCheckbox = document.querySelector('#calendar--showDueDates');
    var showCloseDatesCheckbox = document.querySelector('#calendar--showCloseDates');
    var showMilestoneDueDatesCheckbox = document.querySelector('#calendar--showMilestoneDueDates');
    var showMilestoneCompleteDatesCheckbox = document.querySelector('#calendar--showMilestoneCompleteDates');
    // Current date state
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth() + 1; // 1-12
    var monthNames = [
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
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    /**
     * Note:
     * Use cityssm.escapeHTML(text) for HTML escaping to ensure consistent behavior
     * across the application.
     */
    function updateMonthTitle() {
        monthTitleElement.textContent = "".concat(monthNames[currentMonth - 1], " ").concat(currentYear);
    }
    /**
     * Get the left icon HTML for an event type (work order icon or check icon)
     */
    function getEventTypeLeftIcon(eventType) {
        if (eventType.startsWith('milestone')) {
            return '<i class="fa-solid fa-check"></i>';
        }
        return "<i class=\"fa-solid ".concat(shiftLog.workOrdersIconClass, "\"></i>");
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
        var _a, _b;
        var statusText;
        var rightTagClass;
        function getOpenOrOverdueStatus(dueDateTime, currentDate) {
            var localStatusText = 'Open';
            var localRightTagClass;
            if (dueDateTime !== null && dueDateTime !== undefined) {
                var dueDate = new Date(dueDateTime);
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < currentDate) {
                    localStatusText = 'Overdue';
                    localRightTagClass = 'is-light is-danger';
                }
                else {
                    localRightTagClass = 'is-light is-success';
                }
            }
            else {
                localRightTagClass = 'is-light is-success';
            }
            return {
                statusText: localStatusText,
                rightTagClass: localRightTagClass
            };
        }
        if (event.eventType.startsWith('workOrder')) {
            // Work order logic
            if (event.workOrderCloseDateTime === null) {
                // Work order is open
                ;
                (_a = getOpenOrOverdueStatus(event.workOrderDueDateTime, currentDate), statusText = _a.statusText, rightTagClass = _a.rightTagClass);
            }
            else {
                statusText = 'Closed';
                rightTagClass = 'is-light';
            }
        }
        else if (event.milestoneCompleteDateTime === null) {
            // Non-work-order event that is not yet complete
            ;
            (_b = getOpenOrOverdueStatus(event.milestoneDueDateTime, currentDate), statusText = _b.statusText, rightTagClass = _b.rightTagClass);
        }
        else {
            // Non-work-order event that is complete
            statusText = 'Closed';
            rightTagClass = 'is-light';
        }
        return { statusText: statusText, rightTagClass: rightTagClass };
    }
    function renderCalendar(events) {
        var _a, _b, _c, _d;
        // Group events by date
        var eventsByDate = new Map();
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_1 = events_1[_i];
            var eventDate = new Date(event_1.eventDate);
            var dateKey = eventDate.toISOString().split('T')[0];
            if (!eventsByDate.has(dateKey)) {
                eventsByDate.set(dateKey, []);
            }
            (_a = eventsByDate.get(dateKey)) === null || _a === void 0 ? void 0 : _a.push(event_1);
        }
        // Calculate calendar grid
        var firstDay = new Date(currentYear, currentMonth - 1, 1);
        var lastDay = new Date(currentYear, currentMonth, 0);
        var daysInMonth = lastDay.getDate();
        var startingDayOfWeek = firstDay.getDay();
        var calendarElement = document.createElement('table');
        calendarElement.className = 'table is-fullwidth is-bordered';
        calendarElement.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';
        // Header row
        for (var _e = 0, dayNames_1 = dayNames; _e < dayNames_1.length; _e++) {
            var dayName = dayNames_1[_e];
            (_b = calendarElement
                .querySelector('thead tr')) === null || _b === void 0 ? void 0 : _b.insertAdjacentHTML('beforeend', "<th class=\"has-text-centered\">".concat(cityssm.escapeHTML(dayName), "</th>"));
        }
        var dayCounter = 1;
        var calendarDay = 1 - startingDayOfWeek;
        // Generate weeks
        while (dayCounter <= daysInMonth) {
            var weekRowElement = document.createElement('tr');
            // Generate days in week
            for (var dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
                if (calendarDay < 1 || calendarDay > daysInMonth) {
                    var emptyCell = document.createElement('td');
                    emptyCell.className = 'has-background-light';
                    weekRowElement.append(emptyCell);
                }
                else {
                    var dateKey = "".concat(currentYear, "-").concat(String(currentMonth).padStart(2, '0'), "-").concat(String(calendarDay).padStart(2, '0'));
                    var dayEvents = (_c = eventsByDate.get(dateKey)) !== null && _c !== void 0 ? _c : [];
                    var dayCell = document.createElement('td');
                    dayCell.className = 'is-vcentered';
                    dayCell.style.verticalAlign = 'top';
                    dayCell.style.minHeight = '120px';
                    dayCell.innerHTML = "<div class=\"has-text-weight-bold mb-2\">".concat(cityssm.escapeHTML(String(calendarDay)), "</div>");
                    if (dayEvents.length > 0) {
                        // Create current date once for all events in this day
                        var currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0); // Reset to midnight for date comparison
                        for (var _f = 0, dayEvents_1 = dayEvents; _f < dayEvents_1.length; _f++) {
                            var event_2 = dayEvents_1[_f];
                            var eventClass = getEventTypeClass(event_2.eventType);
                            var leftIcon = getEventTypeLeftIcon(event_2.eventType);
                            var statusIcon = getEventTypeStatusIcon(event_2.eventType);
                            var _g = getEventStatus(event_2, currentDate), statusText = _g.statusText, rightTagClass = _g.rightTagClass;
                            var titleWithStatus = event_2.milestoneTitle
                                ? "".concat(event_2.workOrderNumber, " - ").concat(event_2.milestoneTitle, " (").concat(statusText, ")")
                                : "".concat(event_2.workOrderNumber, " (").concat(statusText, ")");
                            // Create a tag with addons: left side has icons, right side has work order number
                            var safeHref = encodeURI(shiftLog.buildWorkOrderURL(event_2.workOrderId));
                            // eslint-disable-next-line no-unsanitized/method -- URL is encoded, user content is escaped
                            dayCell.insertAdjacentHTML('beforeend', 
                            /* html */ "\n                  <div class=\"tags has-addons mb-1\">\n                    <a class=\"tag ".concat(eventClass, "\" href=\"").concat(safeHref, "\" title=\"").concat(cityssm.escapeHTML(titleWithStatus), "\">\n                      <span class=\"icon is-small\">").concat(leftIcon, "</span>\n                      <span class=\"icon is-small\">").concat(statusIcon, "</span>\n                    </a>\n                    <a class=\"tag ").concat(rightTagClass, "\" href=\"").concat(safeHref, "\" title=\"").concat(cityssm.escapeHTML(titleWithStatus), "\">\n                      ").concat(cityssm.escapeHTML(event_2.workOrderNumber), "\n                    </a>\n                  </div>\n                "));
                        }
                    }
                    weekRowElement.append(dayCell);
                    if (calendarDay >= 1 && calendarDay <= daysInMonth) {
                        dayCounter += 1;
                    }
                }
                calendarDay += 1;
            }
            (_d = calendarElement.querySelector('tbody')) === null || _d === void 0 ? void 0 : _d.append(weekRowElement);
        }
        calendarContainerElement.replaceChildren(calendarElement);
    }
    function loadCalendar() {
        updateMonthTitle();
        cityssm.postJSON("".concat(shiftLog.urlPrefix, "/").concat(shiftLog.workOrdersRouter, "/doGetCalendarEvents"), {
            month: currentMonth,
            year: currentYear,
            assignedToId: assignedToSelect.value,
            showCloseDates: showCloseDatesCheckbox.checked,
            showDueDates: showDueDatesCheckbox.checked,
            showMilestoneCompleteDates: showMilestoneCompleteDatesCheckbox.checked,
            showMilestoneDueDates: showMilestoneDueDatesCheckbox.checked,
            showOpenDates: showOpenDatesCheckbox.checked
        }, function (responseJSON) {
            renderCalendar(responseJSON.events);
        });
    }
    // Event listeners
    previousMonthButtonElement.addEventListener('click', function () {
        if (currentMonth === 1) {
            currentMonth = 12;
            currentYear -= 1;
        }
        else {
            currentMonth -= 1;
        }
        loadCalendar();
    });
    nextMonthButtonElement.addEventListener('click', function () {
        if (currentMonth === 12) {
            currentMonth = 1;
            currentYear += 1;
        }
        else {
            currentMonth += 1;
        }
        loadCalendar();
    });
    assignedToSelect.addEventListener('change', function () {
        loadCalendar();
    });
    showOpenDatesCheckbox.addEventListener('change', function () {
        loadCalendar();
    });
    showDueDatesCheckbox.addEventListener('change', function () {
        loadCalendar();
    });
    showCloseDatesCheckbox.addEventListener('change', function () {
        loadCalendar();
    });
    showMilestoneDueDatesCheckbox.addEventListener('change', function () {
        loadCalendar();
    });
    showMilestoneCompleteDatesCheckbox.addEventListener('change', function () {
        loadCalendar();
    });
    // Initial load
    loadCalendar();
})();
