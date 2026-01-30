"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    /*
     * Unsaved Changes
     */
    var unsavedChanges = new Set();
    function setUnsavedChanges(changeTracker) {
        if (changeTracker === void 0) { changeTracker = ''; }
        if (!unsavedChanges.has(changeTracker)) {
            unsavedChanges.add(changeTracker);
            cityssm.enableNavBlocker();
        }
    }
    function clearUnsavedChanges(changeTracker) {
        if (changeTracker === void 0) { changeTracker = ''; }
        unsavedChanges.delete(changeTracker);
        if (unsavedChanges.size === 0) {
            cityssm.disableNavBlocker();
        }
    }
    function hasUnsavedChanges(changeTracker) {
        if (changeTracker === void 0) { changeTracker = ''; }
        return unsavedChanges.has(changeTracker);
    }
    /*
     * Record Menu Tabs
     */
    function initializeRecordTabs(tabsContainerElement) {
        var menuTabElements = tabsContainerElement.querySelectorAll('.menu a');
        var tabContainerElements = tabsContainerElement.querySelectorAll('.tabs-container > div');
        function doSelectTab(clickEvent) {
            clickEvent.preventDefault();
            // Remove .is-active from all tabs
            for (var _i = 0, menuTabElements_3 = menuTabElements; _i < menuTabElements_3.length; _i++) {
                var menuTabElement = menuTabElements_3[_i];
                menuTabElement.classList.remove('is-active');
            }
            // Set .is-active on clicked tab
            var selectedTabElement = clickEvent.currentTarget;
            selectedTabElement.classList.add('is-active');
            // Hide all but selected tab
            var selectedTabContainerId = selectedTabElement.href.slice(Math.max(0, selectedTabElement.href.indexOf('#') + 1));
            for (var _a = 0, tabContainerElements_2 = tabContainerElements; _a < tabContainerElements_2.length; _a++) {
                var tabContainerElement = tabContainerElements_2[_a];
                tabContainerElement.classList.toggle('is-hidden', tabContainerElement.id !== selectedTabContainerId);
            }
        }
        for (var _i = 0, menuTabElements_1 = menuTabElements; _i < menuTabElements_1.length; _i++) {
            var menuTabElement = menuTabElements_1[_i];
            menuTabElement.addEventListener('click', doSelectTab);
        }
        // Check for hash in URL and activate corresponding tab
        if (globalThis.location.hash !== '') {
            var targetTabId = globalThis.location.hash.slice(1);
            // Escape the targetTabId for safe use in CSS selector
            var escapedTargetTabId = CSS.escape(targetTabId);
            var targetTabLink = tabsContainerElement.querySelector(".menu a[href=\"#".concat(escapedTargetTabId, "\"]"));
            if (targetTabLink !== null) {
                // Remove .is-active from all tabs
                for (var _a = 0, menuTabElements_2 = menuTabElements; _a < menuTabElements_2.length; _a++) {
                    var menuTabElement = menuTabElements_2[_a];
                    menuTabElement.classList.remove('is-active');
                }
                // Set .is-active on target tab
                targetTabLink.classList.add('is-active');
                // Hide all but target tab
                for (var _b = 0, tabContainerElements_1 = tabContainerElements; _b < tabContainerElements_1.length; _b++) {
                    var tabContainerElement = tabContainerElements_1[_b];
                    tabContainerElement.classList.toggle('is-hidden', tabContainerElement.id !== targetTabId);
                }
            }
        }
    }
    /*
     * URL builders
     */
    function buildShiftURL(shiftId, edit) {
        if (edit === void 0) { edit = false; }
        return "".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.shiftsRouter, "/").concat(shiftId.toString()).concat(edit ? '/edit' : '');
    }
    function buildWorkOrderURL(workOrderId, edit) {
        if (edit === void 0) { edit = false; }
        return "".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.workOrdersRouter, "/").concat(workOrderId.toString()).concat(edit ? '/edit' : '');
    }
    function buildTimesheetURL(timesheetId, edit) {
        if (edit === void 0) { edit = false; }
        return "".concat(exports.shiftLog.urlPrefix, "/").concat(exports.shiftLog.timesheetsRouter, "/").concat(timesheetId.toString()).concat(edit ? '/edit' : '');
    }
    /*
     * Pagination Controls
     */
    /**
     * Build pagination controls for lists with page navigation
     * Shows up to 10 page links including current page and neighboring pages
     * @param options Configuration object for pagination
     * @param options.totalCount Total number of items
     * @param options.currentPageOrOffset Current page number (1-indexed) or offset (0-indexed)
     * @param options.itemsPerPageOrLimit Number of items per page or limit
     * @param options.clickHandler Callback function that receives the page number (1-indexed)
     * @returns HTMLElement containing the pagination controls
     */
    function buildPaginationControls(options) {
        var totalCount = options.totalCount, currentPageOrOffset = options.currentPageOrOffset, itemsPerPageOrLimit = options.itemsPerPageOrLimit, clickHandler = options.clickHandler;
        // Validate itemsPerPageOrLimit to prevent division by zero
        if (itemsPerPageOrLimit <= 0) {
            throw new Error('itemsPerPageOrLimit must be greater than 0');
        }
        var paginationElement = document.createElement('nav');
        paginationElement.className = 'pagination is-centered mt-4';
        paginationElement.setAttribute('role', 'navigation');
        paginationElement.setAttribute('aria-label', 'pagination');
        var totalPages = Math.ceil(totalCount / itemsPerPageOrLimit);
        // Calculate current page from either page number or offset
        // If currentPageOrOffset is 0 or greater than totalPages, treat it as an offset
        var currentPage = currentPageOrOffset === 0 || currentPageOrOffset > totalPages
            ? Math.floor(currentPageOrOffset / itemsPerPageOrLimit) + 1
            : currentPageOrOffset;
        var paginationHTML = '';
        // Previous button
        paginationHTML +=
            currentPage > 1
                ? "<a class=\"pagination-previous\" href=\"#\" data-page-number=\"".concat(currentPage - 1, "\">Previous</a>")
                : '<a class="pagination-previous" disabled>Previous</a>';
        // Next button
        paginationHTML +=
            currentPage < totalPages
                ? "<a class=\"pagination-next\" href=\"#\" data-page-number=\"".concat(currentPage + 1, "\">Next</a>")
                : '<a class="pagination-next" disabled>Next</a>';
        // Page numbers with smart ellipsis
        paginationHTML += '<ul class="pagination-list">';
        var maxVisiblePages = 10;
        var startPage = 1;
        var endPage = totalPages;
        if (totalPages > maxVisiblePages) {
            // Calculate range around current page
            var halfVisible = Math.floor(maxVisiblePages / 2);
            startPage = Math.max(1, currentPage - halfVisible);
            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            // Adjust if we're near the end
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }
        // Always show first page
        if (startPage > 1) {
            paginationHTML += /* html */ "\n        <li>\n          <a class=\"pagination-link\" data-page-number=\"1\" href=\"#\">1</a>\n        </li>\n      ";
            if (startPage > 2) {
                paginationHTML += /* html */ "\n          <li>\n            <span class=\"pagination-ellipsis\">&hellip;</span>\n          </li>\n        ";
            }
        }
        // Show page range
        for (var pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
            paginationHTML +=
                pageNumber === currentPage
                    ? /* html */ "\n            <li>\n              <a class=\"pagination-link is-current\" aria-current=\"page\">".concat(pageNumber, "</a>\n            </li>\n          ")
                    : /* html */ "\n            <li>\n              <a class=\"pagination-link\" data-page-number=\"".concat(pageNumber, "\" href=\"#\">").concat(pageNumber, "</a>\n            </li>\n          ");
        }
        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML +=
                    '<li><span class="pagination-ellipsis">&hellip;</span></li>';
            }
            paginationHTML += "<li><a class=\"pagination-link\" data-page-number=\"".concat(totalPages, "\" href=\"#\">").concat(totalPages, "</a></li>");
        }
        paginationHTML += '</ul>';
        // eslint-disable-next-line no-unsanitized/property
        paginationElement.innerHTML = paginationHTML;
        // Event listeners
        var pageLinks = paginationElement.querySelectorAll('a.pagination-previous, a.pagination-next, a.pagination-link');
        for (var _i = 0, pageLinks_1 = pageLinks; _i < pageLinks_1.length; _i++) {
            var pageLink = pageLinks_1[_i];
            pageLink.addEventListener('click', function (event) {
                event.preventDefault();
                var target = event.currentTarget;
                var pageNumberString = target.dataset.pageNumber;
                if (pageNumberString !== undefined) {
                    var pageNumber = Number.parseInt(pageNumberString, 10);
                    clickHandler(pageNumber);
                }
            });
        }
        return paginationElement;
    }
    /*
     * Declare shiftLog
     */
    exports.shiftLog = __assign(__assign({}, exports.shiftLog), { daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], clearUnsavedChanges: clearUnsavedChanges, hasUnsavedChanges: hasUnsavedChanges, setUnsavedChanges: setUnsavedChanges, buildShiftURL: buildShiftURL, buildTimesheetURL: buildTimesheetURL, buildWorkOrderURL: buildWorkOrderURL, initializeRecordTabs: initializeRecordTabs, buildPaginationControls: buildPaginationControls });
})();
