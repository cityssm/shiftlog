(() => {
    const unsavedChanges = new Set();
    function setUnsavedChanges(changeTracker = '') {
        if (!unsavedChanges.has(changeTracker)) {
            unsavedChanges.add(changeTracker);
            cityssm.enableNavBlocker();
        }
    }
    function clearUnsavedChanges(changeTracker = '') {
        unsavedChanges.delete(changeTracker);
        if (unsavedChanges.size === 0) {
            cityssm.disableNavBlocker();
        }
    }
    function hasUnsavedChanges(changeTracker = '') {
        return unsavedChanges.has(changeTracker);
    }
    function initializeRecordTabs(tabsContainerElement) {
        const menuTabElements = tabsContainerElement.querySelectorAll('.menu a');
        const tabContainerElements = tabsContainerElement.querySelectorAll('.tabs-container > div');
        function doSelectTab(clickEvent) {
            clickEvent.preventDefault();
            for (const menuTabElement of menuTabElements) {
                menuTabElement.classList.remove('is-active');
            }
            const selectedTabElement = clickEvent.currentTarget;
            selectedTabElement.classList.add('is-active');
            const selectedTabContainerId = selectedTabElement.href.slice(Math.max(0, selectedTabElement.href.indexOf('#') + 1));
            for (const tabContainerElement of tabContainerElements) {
                tabContainerElement.classList.toggle('is-hidden', tabContainerElement.id !== selectedTabContainerId);
            }
        }
        for (const menuTabElement of menuTabElements) {
            menuTabElement.addEventListener('click', doSelectTab);
        }
        if (globalThis.location.hash !== '') {
            const targetTabId = globalThis.location.hash.slice(1);
            const escapedTargetTabId = CSS.escape(targetTabId);
            const targetTabLink = tabsContainerElement.querySelector(`.menu a[href="#${escapedTargetTabId}"]`);
            if (targetTabLink !== null) {
                for (const menuTabElement of menuTabElements) {
                    menuTabElement.classList.remove('is-active');
                }
                targetTabLink.classList.add('is-active');
                for (const tabContainerElement of tabContainerElements) {
                    tabContainerElement.classList.toggle('is-hidden', tabContainerElement.id !== targetTabId);
                }
            }
        }
    }
    function buildShiftURL(shiftId, edit = false) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.shiftsRouter}/${shiftId.toString()}${edit ? '/edit' : ''}`;
    }
    function buildWorkOrderURL(workOrderId, edit = false) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId.toString()}${edit ? '/edit' : ''}`;
    }
    function buildTimesheetURL(timesheetId, edit = false) {
        return `${exports.shiftLog.urlPrefix}/${exports.shiftLog.timesheetsRouter}/${timesheetId.toString()}${edit ? '/edit' : ''}`;
    }
    function populateSectionAliases(containerElement = document.body) {
        const sectionAliasElements = containerElement.querySelectorAll('[data-section-alias]');
        for (const sectionAliasElement of sectionAliasElements) {
            const sectionAlias = sectionAliasElement.dataset.sectionAlias;
            switch (sectionAlias) {
                case 'shiftsSectionName': {
                    sectionAliasElement.textContent =
                        exports.shiftLog.shiftsSectionName ?? '';
                    break;
                }
                case 'shiftsSectionNameSingular': {
                    sectionAliasElement.textContent =
                        exports.shiftLog.shiftsSectionNameSingular ?? '';
                    break;
                }
                case 'timesheetsSectionName': {
                    sectionAliasElement.textContent =
                        exports.shiftLog.timesheetsSectionName ?? '';
                    break;
                }
                case 'timesheetsSectionNameSingular': {
                    sectionAliasElement.textContent =
                        exports.shiftLog.timesheetsSectionNameSingular ?? '';
                    break;
                }
                case 'workOrdersSectionName': {
                    sectionAliasElement.textContent =
                        exports.shiftLog.workOrdersSectionName ?? '';
                    break;
                }
                case 'workOrdersSectionNameSingular': {
                    sectionAliasElement.textContent =
                        exports.shiftLog.workOrdersSectionNameSingular ?? '';
                    break;
                }
            }
            const transform = sectionAliasElement.dataset.sectionAliasTransform;
            if (transform === 'lowerCase') {
                sectionAliasElement.textContent =
                    sectionAliasElement.textContent.toLowerCase();
            }
        }
    }
    function buildPaginationControls(options) {
        const { totalCount, currentPageOrOffset, itemsPerPageOrLimit, clickHandler } = options;
        if (itemsPerPageOrLimit <= 0) {
            throw new Error('itemsPerPageOrLimit must be greater than 0');
        }
        const paginationElement = document.createElement('nav');
        paginationElement.className = 'pagination is-centered mt-4';
        paginationElement.setAttribute('role', 'navigation');
        paginationElement.setAttribute('aria-label', 'pagination');
        const totalPages = Math.ceil(totalCount / itemsPerPageOrLimit);
        const currentPage = currentPageOrOffset === 0 || currentPageOrOffset > totalPages
            ? Math.floor(currentPageOrOffset / itemsPerPageOrLimit) + 1
            : currentPageOrOffset;
        let paginationHTML = '';
        paginationHTML +=
            currentPage > 1
                ? `<a class="pagination-previous" href="#" data-page-number="${currentPage - 1}">Previous</a>`
                : '<a class="pagination-previous" disabled>Previous</a>';
        paginationHTML +=
            currentPage < totalPages
                ? `<a class="pagination-next" href="#" data-page-number="${currentPage + 1}">Next</a>`
                : '<a class="pagination-next" disabled>Next</a>';
        paginationHTML += '<ul class="pagination-list">';
        const maxVisiblePages = 10;
        let startPage = 1;
        let endPage = totalPages;
        if (totalPages > maxVisiblePages) {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            startPage = Math.max(1, currentPage - halfVisible);
            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }
        if (startPage > 1) {
            paginationHTML += `
        <li>
          <a class="pagination-link" data-page-number="1" href="#">1</a>
        </li>
      `;
            if (startPage > 2) {
                paginationHTML += `
          <li>
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
        `;
            }
        }
        for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
            paginationHTML +=
                pageNumber === currentPage
                    ? `
            <li>
              <a class="pagination-link is-current" aria-current="page">${pageNumber}</a>
            </li>
          `
                    : `
            <li>
              <a class="pagination-link" data-page-number="${pageNumber}" href="#">${pageNumber}</a>
            </li>
          `;
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML +=
                    '<li><span class="pagination-ellipsis">&hellip;</span></li>';
            }
            paginationHTML += `<li><a class="pagination-link" data-page-number="${totalPages}" href="#">${totalPages}</a></li>`;
        }
        paginationHTML += '</ul>';
        paginationElement.innerHTML = paginationHTML;
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
    exports.shiftLog = {
        ...exports.shiftLog,
        daysOfWeek: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ],
        clearUnsavedChanges,
        hasUnsavedChanges,
        setUnsavedChanges,
        buildShiftURL,
        buildTimesheetURL,
        buildWorkOrderURL,
        populateSectionAliases,
        initializeRecordTabs,
        buildPaginationControls
    };
})();
