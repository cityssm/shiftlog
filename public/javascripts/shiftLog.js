(() => {
    /*
     * Unsaved Changes
     */
    let _hasUnsavedChanges = false;
    function setUnsavedChanges() {
        if (!hasUnsavedChanges()) {
            _hasUnsavedChanges = true;
            cityssm.enableNavBlocker();
        }
    }
    function clearUnsavedChanges() {
        _hasUnsavedChanges = false;
        cityssm.disableNavBlocker();
    }
    function hasUnsavedChanges() {
        return _hasUnsavedChanges;
    }
    /*
     * Record Menu Tabs
     */
    function initializeRecordTabs(tabsContainerElement) {
        const menuTabElements = tabsContainerElement.querySelectorAll('.menu a');
        const tabContainerElements = tabsContainerElement.querySelectorAll('.tabs-container > div');
        function doSelectTab(clickEvent) {
            clickEvent.preventDefault();
            // Remove .is-active from all tabs
            for (const menuTabElement of menuTabElements) {
                menuTabElement.classList.remove('is-active');
            }
            // Set .is-active on clicked tab
            const selectedTabElement = clickEvent.currentTarget;
            selectedTabElement.classList.add('is-active');
            // Hide all but selected tab
            const selectedTabContainerId = selectedTabElement.href.slice(Math.max(0, selectedTabElement.href.indexOf('#') + 1));
            for (const tabContainerElement of tabContainerElements) {
                tabContainerElement.classList.toggle('is-hidden', tabContainerElement.id !== selectedTabContainerId);
            }
        }
        for (const menuTabElement of menuTabElements) {
            menuTabElement.addEventListener('click', doSelectTab);
        }
    }
    /*
     * URL builders
     */
    function buildShiftURL(shiftId, edit = false) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.shiftsRouter}/${shiftId.toString()}${edit ? '/edit' : ''}`;
    }
    function buildWorkOrderURL(workOrderId, edit = false) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId.toString()}${edit ? '/edit' : ''}`;
    }
    function buildTimesheetURL(timesheetId, edit = false) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.timesheetsRouter}/${timesheetId.toString()}${edit ? '/edit' : ''}`;
    }
    /*
     * Pagination Controls
     */
    /**
     * Build pagination controls for lists with page navigation
     * Shows up to 10 page links including current page and neighboring pages
     * @param totalCount Total number of items
     * @param currentPageOrOffset Current page number (1-indexed) or offset (0-indexed)
     * @param itemsPerPageOrLimit Number of items per page or limit
     * @param clickHandler Callback function that receives the page number (1-indexed)
     * @returns HTMLElement containing the pagination controls
     */
    function buildPaginationControls(totalCount, currentPageOrOffset, itemsPerPageOrLimit, clickHandler) {
        const paginationElement = document.createElement('nav');
        paginationElement.className = 'pagination is-centered mt-4';
        paginationElement.setAttribute('role', 'navigation');
        paginationElement.setAttribute('aria-label', 'pagination');
        const totalPages = Math.ceil(totalCount / itemsPerPageOrLimit);
        // Calculate current page - if currentPageOrOffset is greater than totalPages,
        // it's likely an offset value, so calculate the page from it
        const currentPage = currentPageOrOffset > totalPages
            ? Math.floor(currentPageOrOffset / itemsPerPageOrLimit) + 1
            : currentPageOrOffset;
        let paginationHTML = '';
        // Previous button
        paginationHTML +=
            currentPage > 1
                ? `<a class="pagination-previous" href="#" data-page-number="${currentPage - 1}">Previous</a>`
                : '<a class="pagination-previous" disabled>Previous</a>';
        // Next button
        paginationHTML +=
            currentPage < totalPages
                ? `<a class="pagination-next" href="#" data-page-number="${currentPage + 1}">Next</a>`
                : '<a class="pagination-next" disabled>Next</a>';
        // Page numbers with smart ellipsis
        paginationHTML += '<ul class="pagination-list">';
        const maxVisiblePages = 10;
        let startPage = 1;
        let endPage = totalPages;
        if (totalPages > maxVisiblePages) {
            // Calculate range around current page
            const halfVisible = Math.floor(maxVisiblePages / 2);
            startPage = Math.max(1, currentPage - halfVisible);
            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            // Adjust if we're near the end
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }
        // Always show first page
        if (startPage > 1) {
            paginationHTML += /* html */ `
        <li>
          <a class="pagination-link" data-page-number="1" href="#">1</a>
        </li>
      `;
            if (startPage > 2) {
                paginationHTML += /* html */ `
          <li>
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
        `;
            }
        }
        // Show page range
        for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
            paginationHTML +=
                pageNumber === currentPage
                    ? /* html */ `
            <li>
              <a class="pagination-link is-current" aria-current="page">${pageNumber}</a>
            </li>
          `
                    : /* html */ `
            <li>
              <a class="pagination-link" data-page-number="${pageNumber}" href="#">${pageNumber}</a>
            </li>
          `;
        }
        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML +=
                    '<li><span class="pagination-ellipsis">&hellip;</span></li>';
            }
            paginationHTML += `<li><a class="pagination-link" data-page-number="${totalPages}" href="#">${totalPages}</a></li>`;
        }
        paginationHTML += '</ul>';
        // eslint-disable-next-line no-unsanitized/property
        paginationElement.innerHTML = paginationHTML;
        // Event listeners
        const pageLinks = paginationElement.querySelectorAll('a.pagination-previous, a.pagination-next, a.pagination-link');
        for (const pageLink of pageLinks) {
            pageLink.addEventListener('click', (event) => {
                event.preventDefault();
                const target = event.currentTarget;
                const pageNumberString = target.dataset.pageNumber;
                if (pageNumberString !== undefined) {
                    const pageNumber = Number.parseInt(pageNumberString, 10);
                    clickHandler(pageNumber);
                }
            });
        }
        return paginationElement;
    }
    /*
     * Declare shiftLog
     */
    exports.shiftLog = {
        ...exports.shiftLog,
        clearUnsavedChanges,
        hasUnsavedChanges,
        setUnsavedChanges,
        buildShiftURL,
        buildTimesheetURL,
        buildWorkOrderURL,
        initializeRecordTabs,
        buildPaginationControls
    };
})();
