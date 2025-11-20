(() => {
    const filtersFormElement = document.querySelector('#form--workOrderSearch');
    const offsetInputElement = document.querySelector('#workOrderSearch--offset');
    const resultsContainerElement = document.querySelector('#container--workOrderSearchResults');
    function buildPaginationControls(totalCount, limit, offset) {
        const paginationElement = document.createElement('nav');
        paginationElement.className = 'pagination is-centered';
        paginationElement.setAttribute('role', 'navigation');
        paginationElement.setAttribute('aria-label', 'pagination');
        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        let paginationHTML = '';
        // Previous button
        paginationHTML +=
            currentPage > 1
                ? `<a class="pagination-previous" href="#" data-page-number="${currentPage - 1}">Previous</a>`
                : `<a class="pagination-previous" disabled>Previous</a>`;
        // Next button
        paginationHTML +=
            currentPage < totalPages
                ? `<a class="pagination-next" href="#" data-page-number="${currentPage + 1}">Next</a>`
                : `<a class="pagination-next" disabled>Next</a>`;
        // Page numbers
        paginationHTML += `<ul class="pagination-list">`;
        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
            paginationHTML +=
                pageNumber === currentPage
                    ? `<li><a class="pagination-link is-current" aria-current="page">${pageNumber}</a></li>`
                    : `<li><a class="pagination-link" href="#" data-page-number="${pageNumber}">${pageNumber}</a></li>`;
        }
        paginationHTML += `</ul>`;
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
                    offsetInputElement.value = ((pageNumber - 1) * limit).toString();
                    getSearchResults();
                }
            });
        }
        return paginationElement;
    }
    function renderWorkOrdersTable(data) {
        if (data.workOrders.length === 0) {
            resultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">No records found.</p>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = /* html */ `
      <thead>
        <tr>
          <th>Number</th>
          <th>Type</th>
          <th>Status</th>
          <th>Open Date</th>
          <th>Requestor</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
        const tableBodyElement = tableElement.querySelector('tbody');
        for (const workOrder of data.workOrders) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.innerHTML = /* html */ `
        <td>
          <a href="${exports.shiftLog.buildWorkOrderURL(workOrder.workOrderId)}">
            ${cityssm.escapeHTML(workOrder.workOrderNumber)}
          </a>
        </td>
        <td>${cityssm.escapeHTML(workOrder.workOrderTypeDataListItem ?? '(Unknown Type)')}</td>
        <td>${cityssm.escapeHTML(workOrder.workOrderStatusDataListItem ?? '(No Status)')}</td>
        <td>${cityssm.dateToString(new Date(workOrder.workOrderOpenDateTime))}</td>
        <td>${cityssm.escapeHTML(workOrder.requestorName === '' ? '(N/A)' : workOrder.requestorName)}</td>
      `;
            tableBodyElement.append(tableRowElement);
        }
        resultsContainerElement.replaceChildren(tableElement);
        // Pagination
        resultsContainerElement.append(buildPaginationControls(data.totalCount, data.limit, data.offset));
    }
    function getSearchResults() {
        resultsContainerElement.innerHTML = /* html */ `
      <div class="has-text-centered py-5">
        <span class="icon is-large has-text-grey-lighter">
          <i class="fa-solid fa-spinner fa-pulse fa-2x"></i>
        </span>
      </div>
    `;
        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doSearchWorkOrders`, filtersFormElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderWorkOrdersTable(responseJSON);
        });
    }
    filtersFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
    });
    const formElements = filtersFormElement.querySelectorAll('input, select');
    for (const formElement of formElements) {
        formElement.addEventListener('change', () => {
            offsetInputElement.value = '0';
            getSearchResults();
        });
    }
    getSearchResults();
})();
