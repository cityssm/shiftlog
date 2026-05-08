(() => {
    const workOrderFormElement = document.querySelector('#form--workOrder');
    const workOrderId = workOrderFormElement === null
        ? ''
        : workOrderFormElement.querySelector('#workOrder--workOrderId').value;
    const subscribersContainerElement = document.querySelector('#container--subscribers');
    if (subscribersContainerElement === null) {
        return;
    }
    function renderSubscribers(subscribers) {
        const subscribersCountElement = document.querySelector('#subscribersCount');
        if (subscribersCountElement !== null) {
            subscribersCountElement.textContent = subscribers.length.toString();
        }
        if (subscribers.length === 0) {
            subscribersContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">No subscribers have been added.</p>
        </div>
      `;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = `
      <thead>
        <tr>
          <th>Email Address</th>
          <th>Employee Name</th>
          <th>Employee Phone</th>
          ${exports.isEdit ? '<th class="is-hidden-print" style="width: 80px;"></th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>
    `;
        subscribersContainerElement.replaceChildren(tableElement);
        const tbodyElement = tableElement.querySelector('tbody');
        for (const subscriber of subscribers) {
            const trElement = document.createElement('tr');
            const employeeNameHTML = subscriber.firstName === null && subscriber.lastName === null
                ? '<span class="has-text-grey-light">No employee record</span>'
                : `${subscriber.firstName ?? ''} ${subscriber.lastName ?? ''}`.trim();
            trElement.innerHTML = `
        <td>
          <a class="has-text-weight-semibold" href="mailto:${subscriber.subscriberEmailAddress}">
            ${subscriber.subscriberEmailAddress}
          </a>
        </td>
        <td>
          ${employeeNameHTML}
        </td>
        <td>
          ${subscriber.phoneNumber ?? ''}
        </td>
        ${exports.isEdit
                ? `<td class="is-hidden-print">
                <button class="button is-small is-danger is-light button--removeSubscriber" type="button" data-subscriber-sequence="${subscriber.subscriberSequence}" data-subscriber-email-address="${subscriber.subscriberEmailAddress}">
                  <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
                  <span>Remove</span>
                </button>
              </td>`
                : ''}
      `;
            trElement
                .querySelector('.button--removeSubscriber')
                ?.addEventListener('click', () => {
                deleteSubscriber(subscriber.subscriberSequence, subscriber.subscriberEmailAddress);
            });
            tbodyElement.append(trElement);
        }
    }
    function deleteSubscriber(subscriberSequence, subscriberEmailAddress) {
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Remove Subscriber',
            message: `Are you sure you want to remove "${subscriberEmailAddress}"?`,
            okButton: {
                contextualColorName: 'warning',
                text: 'Remove Subscriber',
                callbackFunction() {
                    cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doDeleteWorkOrderSubscriber`, {
                        subscriberSequence,
                        workOrderId: Number.parseInt(workOrderId, 10)
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            renderSubscribers(responseJSON.subscribers);
                        }
                        else {
                            bulmaJS.alert({
                                contextualColorName: 'danger',
                                title: 'Error Removing Subscriber',
                                message: responseJSON.errorMessage
                            });
                        }
                    });
                }
            }
        });
    }
    function addSubscriber() {
        let closeModalFunction;
        function doAddSubscriber(submitEvent) {
            submitEvent.preventDefault();
            const formElement = submitEvent.currentTarget;
            const subscriberEmailAddressInput = formElement.querySelector('#addWorkOrderSubscriber--subscriberEmailAddress');
            cityssm.postJSON(`${exports.shiftLog.urlPrefix}/${exports.shiftLog.workOrdersRouter}/doAddWorkOrderSubscriber`, {
                subscriberEmailAddress: subscriberEmailAddressInput.value,
                workOrderId: Number.parseInt(workOrderId, 10)
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeModalFunction();
                    renderSubscribers(responseJSON.subscribers);
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Subscriber has been successfully added to this work order.',
                        title: 'Subscriber Added'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: responseJSON.errorMessage,
                        title: 'Error Adding Subscriber'
                    });
                }
            });
        }
        cityssm.openHtmlModal('workOrders-addSubscriber', {
            onshow(modalElement) {
                exports.shiftLog.setUnsavedChanges('modal');
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddSubscriber);
            },
            onshown(modalElement, closeFunction) {
                closeModalFunction = closeFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#addWorkOrderSubscriber--subscriberEmailAddress').focus();
            },
            onremoved() {
                exports.shiftLog.clearUnsavedChanges('modal');
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    document
        .querySelector('#button--addSubscriber')
        ?.addEventListener('click', addSubscriber);
    renderSubscribers(exports.workOrderSubscribers);
})();
