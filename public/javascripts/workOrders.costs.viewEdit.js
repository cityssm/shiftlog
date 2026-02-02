(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    /*
     * Costs functionality
     */
    const costsContainerElement = document.querySelector('#container--costs');
    if (costsContainerElement !== null) {
        function renderCosts(costs) {
            // Update costs count
            const costsCountElement = document.querySelector('#costsCount');
            if (costsCountElement !== null) {
                costsCountElement.textContent = costs.length.toString();
            }
            if (costs.length === 0) {
                ;
                costsContainerElement.innerHTML = /* html */ `
          <div class="message is-info">
            <p class="message-body">No costs have been added yet.</p>
          </div>
        `;
                return;
            }
            const tableElement = document.createElement('table');
            tableElement.className = 'table is-fullwidth is-striped is-hoverable';
            // eslint-disable-next-line no-unsanitized/property
            tableElement.innerHTML = /* html */ `
        <thead>
          <tr>
            <th>Description</th>
            <th class="has-text-right">Amount</th>
            <th class="is-hidden-touch">Added By</th>
            <th class="is-hidden-touch">Added On</th>
            ${exports.isEdit ? '<th class="is-hidden-print" style="width: 80px;"></th>' : ''}
          </tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th class="has-text-right" id="costs--total">$0.00</th>
            <th colspan="${exports.isEdit ? '3' : '2'}"></th>
          </tr>
        </tfoot>
      `;
            const tableBodyElement = tableElement.querySelector('tbody');
            let total = 0;
            for (const cost of costs) {
                const tableRowElement = document.createElement('tr');
                const canEdit = exports.shiftLog.userCanManageWorkOrders ||
                    cost.recordCreate_userName === exports.shiftLog.userName;
                total += cost.costAmount;
                // eslint-disable-next-line no-unsanitized/property
                tableRowElement.innerHTML = /* html */ `
          <td>${cityssm.escapeHTML(cost.costDescription)}</td>
          <td class="has-text-right">$${cost.costAmount.toFixed(2)}</td>
          <td class="is-hidden-touch">${cityssm.escapeHTML(cost.recordCreate_userName)}</td>
          <td class="is-hidden-touch">${cityssm.dateToString(new Date(cost.recordCreate_dateTime))}</td>
          ${exports.isEdit && canEdit
                    ? /* html */ `
                <td class="is-hidden-print">
                  <div class="buttons are-small is-justify-content-end">
                    <button
                      class="button edit-cost"
                      data-cost-id="${cost.workOrderCostId}"
                      type="button"
                      title="Edit"
                    >
                      <span class="icon"><i class="fa-solid fa-edit"></i></span>
                    </button>
                    <button
                      class="button is-danger is-light delete-cost"
                      data-cost-id="${cost.workOrderCostId}"
                      type="button"
                      title="Delete"
                    >
                      <span class="icon"><i class="fa-solid fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              `
                    : exports.isEdit
                        ? '<td></td>'
                        : ''}
        `;
                if (exports.isEdit && canEdit) {
                    const editButton = tableRowElement.querySelector('.edit-cost');
                    editButton.addEventListener('click', () => {
                        showEditCostModal(cost);
                    });
                    const deleteButton = tableRowElement.querySelector('.delete-cost');
                    deleteButton.addEventListener('click', () => {
                        deleteCost(cost.workOrderCostId);
                    });
                }
                tableBodyElement.append(tableRowElement);
            }
            // Update total
            const totalElement = tableElement.querySelector('#costs--total');
            if (totalElement !== null) {
                totalElement.textContent = `$${total.toFixed(2)}`;
            }
            costsContainerElement?.replaceChildren(tableElement);
        }
        function showEditCostModal(cost) {
            let closeModalFunction;
            function doUpdateCost(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doUpdateWorkOrderCost`, formElement, (responseJSON) => {
                    if (responseJSON.success) {
                        closeModalFunction();
                        loadCosts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            message: 'Failed to update cost.'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-editCost', {
                onshow(modalElement) {
                    exports.shiftLog.setUnsavedChanges('modal');
                    modalElement.querySelector('#editWorkOrderCost--workOrderCostId').value = cost.workOrderCostId.toString();
                    modalElement.querySelector('#editWorkOrderCost--costAmount').value = cost.costAmount.toString();
                    modalElement.querySelector('#editWorkOrderCost--costDescription').value = cost.costDescription;
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doUpdateCost);
                },
                onremoved() {
                    exports.shiftLog.clearUnsavedChanges('modal');
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function showAddCostModal(event) {
            event?.preventDefault();
            let closeModalFunction;
            function doAddCost(submitEvent) {
                submitEvent.preventDefault();
                const formElement = submitEvent.currentTarget;
                cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doCreateWorkOrderCost`, formElement, (responseJSON) => {
                    if (responseJSON.success) {
                        closeModalFunction();
                        formElement.reset();
                        loadCosts();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Adding Cost',
                            message: responseJSON.errorMessage
                        });
                    }
                });
            }
            cityssm.openHtmlModal('workOrders-addCost', {
                onshow(modalElement) {
                    exports.shiftLog.populateSectionAliases(modalElement);
                    exports.shiftLog.setUnsavedChanges('modal');
                    modalElement.querySelector('#addWorkOrderCost--workOrderId').value = workOrderId;
                },
                onshown(modalElement, _closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    closeModalFunction = _closeModalFunction;
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doAddCost);
                    modalElement.querySelector('#addWorkOrderCost--costAmount').focus();
                },
                onremoved() {
                    exports.shiftLog.clearUnsavedChanges('modal');
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteCost(workOrderCostId) {
            bulmaJS.confirm({
                contextualColorName: 'danger',
                title: 'Delete Cost',
                message: 'Are you sure you want to delete this cost?',
                okButton: {
                    text: 'Delete',
                    callbackFunction: () => {
                        cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderCost`, {
                            workOrderCostId
                        }, (responseJSON) => {
                            if (responseJSON.success) {
                                loadCosts();
                            }
                            else {
                                bulmaJS.alert({
                                    contextualColorName: 'danger',
                                    message: 'Failed to delete cost.'
                                });
                            }
                        });
                    }
                }
            });
        }
        function loadCosts() {
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/${workOrderId}/doGetWorkOrderCosts`, {}, (responseJSON) => {
                renderCosts(responseJSON.costs);
            });
        }
        // Add cost button
        document
            .querySelector('#button--addCost')
            ?.addEventListener('click', showAddCostModal);
        // Load costs initially
        loadCosts();
    }
})();
